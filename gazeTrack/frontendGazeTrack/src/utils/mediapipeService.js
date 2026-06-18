import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

class MediaPipeService {
  constructor() {
    this.landmarker = null;
    this.stream = null;
    this.videoElement = null;
    this.containerElement = null;
    this.latestLandmarks = null;
    this.isTracking = false;
    this.onFrameCallback = null;
    this.calibrationData = []; // Array of { features: [x, y], target: [tx, ty] }
    this.weightsX = null; // Coeffs for X prediction: [w0, w1, w2, w3, w4, w5]
    this.weightsY = null; // Coeffs for Y prediction: [w0, w1, w2, w3, w4, w5]
    this.loadingPromise = null;
  }

  /**
   * Initializes FilesetResolver and FaceLandmarker.
   * Dynamically fetches configurations from the Django backend config endpoint first.
   */
  async init(backendUrl) {
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      let wasmUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm";
      let modelUrl = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Token ${token}` } : {};
        const response = await fetch(`${backendUrl}/api/config/`, { headers });
        if (response.ok) {
          const config = await response.json();
          if (config.mediapipe_wasm_url) wasmUrl = config.mediapipe_wasm_url;
          if (config.mediapipe_model_url) modelUrl = config.mediapipe_model_url;
          console.log('[MediaPipe] Config loaded from backend.');
        }
      } catch (e) {
        console.warn('[MediaPipe] Failed to fetch config from backend, using default CDNs.', e);
      }

      console.log('[MediaPipe] Initializing FaceLandmarker...');
      const vision = await FilesetResolver.forVisionTasks(wasmUrl);
      this.landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelUrl,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      console.log('[MediaPipe] FaceLandmarker initialized successfully.');
      return this.landmarker;
    })();

    return this.loadingPromise;
  }

  /**
   * Starts the webcam stream and creates the DOM overlay container mimicking WebGazer.
   */
  async startStream(onFrameCallback = null) {
    if (this.isTracking) return;

    this.onFrameCallback = onFrameCallback;
    this.isTracking = true;

    // 1. Get webcam access
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, frameRate: { ideal: 30 } },
      audio: false
    });

    // 2. Create local video element
    this.videoElement = document.createElement('video');
    this.videoElement.srcObject = this.stream;
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;
    this.videoElement.style.width = '320px';
    this.videoElement.style.height = '240px';
    this.videoElement.style.objectFit = 'cover';
    this.videoElement.style.transform = 'scaleX(-1)'; // Mirror camera

    // 3. Create or reuse floating preview container (matching #webgazerVideoContainer styling)
    this.containerElement = document.getElementById('webgazerVideoContainer');
    if (!this.containerElement) {
      this.containerElement = document.createElement('div');
      this.containerElement.id = 'webgazerVideoContainer';
      document.body.appendChild(this.containerElement);
    }
    this.containerElement.innerHTML = '';
    this.containerElement.appendChild(this.videoElement);
    this.containerElement.style.display = 'block';

    // 4. Start processing frame loop
    this.videoElement.onloadedmetadata = () => {
      this.videoElement.play();
      this.tick();
    };
  }

  /**
   * Hides the camera preview window.
   */
  hideVideo() {
    if (this.containerElement) {
      this.containerElement.style.display = 'none';
    }
  }

  /**
   * Shows the camera preview window.
   */
  showVideo() {
    if (this.containerElement) {
      this.containerElement.style.display = 'block';
    }
  }

  /**
   * Stops tracking, stops camera tracks, and removes the preview elements.
   */
  stopStream() {
    this.isTracking = false;
    this.onFrameCallback = null;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.containerElement) {
      this.containerElement.style.display = 'none';
      this.containerElement.innerHTML = '';
    }

    this.videoElement = null;
    this.latestLandmarks = null;
  }

  /**
   * Main processing frame loop. Runs client-side on-device face mesh.
   */
  tick() {
    if (!this.isTracking || !this.videoElement || !this.landmarker) return;

    if (this.videoElement.readyState >= 2) {
      const timestamp = performance.now();
      const results = this.landmarker.detectForVideo(this.videoElement, timestamp);
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        this.latestLandmarks = results.faceLandmarks[0];
        
        if (this.onFrameCallback) {
          const features = this.getCurrentFeatures();
          if (features) {
            const gaze = this.getPrediction(features);
            this.onFrameCallback({
              landmarks: this.latestLandmarks,
              features,
              gaze
            });
          } else {
            this.onFrameCallback({ landmarks: this.latestLandmarks, features: null, gaze: null });
          }
        }
      } else {
        this.latestLandmarks = null;
        if (this.onFrameCallback) {
          this.onFrameCallback({ landmarks: null, features: null, gaze: null });
        }
      }
    }

    // Schedule next frame
    requestAnimationFrame(() => this.tick());
  }

  /**
   * Extracts eye/pupil Look Vectors from MediaPipe 478 Face Mesh landmarks.
   * Relies on standard landmark offsets:
   * - Left Eye canthi: 33 (outer corner), 133 (inner corner)
   * - Left Iris center: 468
   * - Right Eye canthi: 362 (inner corner), 263 (outer corner)
   * - Right Iris center: 473
   */
  getCurrentFeatures() {
    if (!this.latestLandmarks) return null;

    try {
      const landmarks = this.latestLandmarks;

      // Left Eye
      const innerL = landmarks[133];
      const outerL = landmarks[33];
      const irisL = landmarks[468];

      const centerLx = (innerL.x + outerL.x) / 2;
      const centerLy = (innerL.y + outerL.y) / 2;
      const widthL = Math.hypot(innerL.x - outerL.x, innerL.y - outerL.y);

      const dxL = (irisL.x - centerLx) / widthL;
      const dyL = (irisL.y - centerLy) / widthL;

      // Right Eye
      const innerR = landmarks[362];
      const outerR = landmarks[263];
      const irisR = landmarks[473];

      const centerRx = (innerR.x + outerR.x) / 2;
      const centerRy = (innerR.y + outerR.y) / 2;
      const widthR = Math.hypot(innerR.x - outerR.x, innerR.y - outerR.y);

      const dxR = (irisR.x - centerRx) / widthR;
      const dyR = (irisR.y - centerRy) / widthR;

      // Return average normalized pupil displacement feature vector
      return [
        (dxL + dxR) / 2,
        (dyL + dyR) / 2
      ];
    } catch (e) {
      console.warn('[MediaPipe] Feature extraction failed:', e);
      return null;
    }
  }

  /**
   * Records a user calibration data sample.
   */
  recordCalibrationPoint(screenX, screenY, features) {
    if (!features) return;
    this.calibrationData.push({
      features, // [x, y]
      target: [screenX, screenY]
    });
  }

  /**
   * Clears historical calibration inputs.
   */
  clearCalibrationData() {
    this.calibrationData = [];
    this.weightsX = null;
    this.weightsY = null;
  }

  /**
   * Solves closed-form Quadratic Ridge Regression mapping:
   * f(x, y) = w0 + w1*x + w2*y + w3*x^2 + w4*y^2 + w5*x*y -> screenCoordinate
   */
  trainModel() {
    const N = this.calibrationData.length;
    if (N < 6) {
      console.warn('[MediaPipe] Not enough calibration data. Need at least 6 points.');
      return false;
    }

    // Construct design matrix A (N x 6) and target vectors X, Y
    const A = [];
    const targetsX = [];
    const targetsY = [];

    for (let i = 0; i < N; i++) {
      const [x, y] = this.calibrationData[i].features;
      const [tx, ty] = this.calibrationData[i].target;

      A.push([1, x, y, x * x, y * y, x * y]);
      targetsX.push(tx);
      targetsY.push(ty);
    }

    // Solve for X weights and Y weights
    this.weightsX = this.solveLeastSquares(A, targetsX, 1e-4);
    this.weightsY = this.solveLeastSquares(A, targetsY, 1e-4);

    console.log('[MediaPipe] Regression Model Trained.', {
      weightsX: Array.from(this.weightsX),
      weightsY: Array.from(this.weightsY)
    });
    return true;
  }

  /**
   * Predicts screen pixel coordinates using the current trained model weights.
   */
  getPrediction(features = null) {
    if (!this.weightsX || !this.weightsY) return null;
    
    const feat = features || this.getCurrentFeatures();
    if (!feat) return null;

    const [x, y] = feat;
    // Map design features: [1, x, y, x^2, y^2, x*y]
    const f0 = 1;
    const f1 = x;
    const f2 = y;
    const f3 = x * x;
    const f4 = y * y;
    const f5 = x * y;

    const predX = this.weightsX[0] * f0 +
                  this.weightsX[1] * f1 +
                  this.weightsX[2] * f2 +
                  this.weightsX[3] * f3 +
                  this.weightsX[4] * f4 +
                  this.weightsX[5] * f5;

    const predY = this.weightsY[0] * f0 +
                  this.weightsY[1] * f1 +
                  this.weightsY[2] * f2 +
                  this.weightsY[3] * f3 +
                  this.weightsY[4] * f4 +
                  this.weightsY[5] * f5;

    return { x: predX, y: predY };
  }

  /**
   * Standard Gaussian Elimination Ridge Regression solver.
   * Solves A^T * A * w = A^T * b with lambda regularization.
   */
  solveLeastSquares(A, b, lambda = 1e-4) {
    const N = A.length;
    const K = A[0].length; // number of features (e.g. 6)

    // 1. M = A^T * A + lambda * I
    const M = Array.from({ length: K }, () => new Float64Array(K));
    for (let i = 0; i < K; i++) {
      for (let j = 0; j < K; j++) {
        let sum = 0;
        for (let n = 0; n < N; n++) {
          sum += A[n][i] * A[n][j];
        }
        M[i][j] = sum + (i === j ? lambda : 0);
      }
    }

    // 2. rhs = A^T * b
    const rhs = new Float64Array(K);
    for (let i = 0; i < K; i++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += A[n][i] * b[n];
      }
      rhs[i] = sum;
    }

    // 3. Augmented matrix [M | rhs]
    const aug = Array.from({ length: K }, (_, i) => {
      const row = new Float64Array(K + 1);
      row.set(M[i]);
      row[K] = rhs[i];
      return row;
    });

    // Gaussian Elimination
    for (let i = 0; i < K; i++) {
      let maxRow = i;
      for (let r = i + 1; r < K; r++) {
        if (Math.abs(aug[r][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = r;
        }
      }

      if (maxRow !== i) {
        const tmp = aug[i];
        aug[i] = aug[maxRow];
        aug[maxRow] = tmp;
      }

      const pivot = aug[i][i];
      if (Math.abs(pivot) < 1e-9) continue;

      for (let r = 0; r < K; r++) {
        if (r !== i) {
          const factor = aug[r][i] / pivot;
          for (let c = i; c <= K; c++) {
            aug[r][c] -= factor * aug[i][c];
          }
        }
      }
    }

    // Back Substitution
    const w = new Float64Array(K);
    for (let i = 0; i < K; i++) {
      w[i] = aug[i][K] / aug[i][i];
    }
    return w;
  }
}

const mediapipeService = new MediaPipeService();
export default mediapipeService;
