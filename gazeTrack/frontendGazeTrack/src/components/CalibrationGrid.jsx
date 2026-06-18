import React, { useEffect, useState } from 'react';
import CalModal from './CalModal';
import Lottie from 'react-lottie';
import * as AnimationDot from "../assets/AnimationDot.json";
import GazeTest from './GazeTest';
import CameraError from './CameraError';
import mediapipeService from '../utils/mediapipeService';

const CalibrationGrid = () => {
    const [dots, setDots] = useState([
        { id: 1, x: '5%',  y: '10%', color: 'red', clicks: 0 },
        { id: 2, x: '50%', y: '10%', color: 'red', clicks: 0 },
        { id: 3, x: '95%', y: '10%', color: 'red', clicks: 0 },
        { id: 4, x: '5%',  y: '50%', color: 'red', clicks: 0 },
        { id: 5, x: '50%', y: '50%', color: 'red', clicks: 0 },
        { id: 6, x: '95%', y: '50%', color: 'red', clicks: 0 },
        { id: 7, x: '5%',  y: '90%', color: 'red', clicks: 0 },
        { id: 8, x: '50%', y: '90%', color: 'red', clicks: 0 },
        { id: 9, x: '95%', y: '90%', color: 'red', clicks: 0 },
    ]);

    const [view, setView]               = useState('calibration');
    const [cameraError, setCameraError] = useState(false);
    const [showInfo, setShowInfo]       = useState(true);

    const toggleInfo = () => setShowInfo(s => !s);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: AnimationDot.default,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    };

    // ── Init MediaPipe (calibrated approach) ───────────────────────────────────
    useEffect(() => {
        const initializeMediaPipe = async () => {
            try {
                const apiUrl = process.env.REACT_APP_BACKEND_URL;
                await mediapipeService.init(apiUrl);
                await mediapipeService.startStream((results) => {
                    if (results.gaze) {
                        console.log("Prediction X/Y:", results.gaze);
                    }
                });
                mediapipeService.showVideo();
                mediapipeService.clearCalibrationData();
            } catch (error) {
                console.error("MediaPipe initialization error:", error);
                setCameraError(true);
            }
        };

        initializeMediaPipe();

        // Do NOT stop MediaPipe on unmount — GazeTest needs it alive
        return () => {
            console.log('[CAL] CalibrationGrid unmount — MediaPipe kept alive for GazeTest.');
        };
    }, []);

    // ── Dot click ──────────────────────────────────────────────────────────────
    const handleClick = (id) => {
        setDots(prev => prev.map(dot => {
            if (dot.id === id && dot.clicks < 5) {
                const newClicks = dot.clicks + 1;
                const newColor  = newClicks === 5 ? 'green' : 'red';

                // Feed calibration data to MediaPipe service
                const screenX = window.innerWidth  * (parseFloat(dot.x) / 100);
                const screenY = window.innerHeight * (parseFloat(dot.y) / 100);
                
                const features = mediapipeService.getCurrentFeatures();
                if (features) {
                    mediapipeService.recordCalibrationPoint(screenX, screenY, features);
                } else {
                    console.warn('[Calibration] No face landmarks detected for this click.');
                }

                return { ...dot, clicks: newClicks, color: newColor };
            }
            return dot;
        }));
    };

    // All dots green → show modal
    useEffect(() => {
        const allGreen = dots.every(d => d.color === 'green');
        if (allGreen) {
            console.log('[CAL] All calibrated → modal.');
            setView('modal');
        }
    }, [dots]);

    // Modal done → GazeTest
    const handleModalComplete = () => {
        mediapipeService.trainModel(); // Compute weights via least squares
        mediapipeService.hideVideo(); // Hide video window for the test
        setView('test');
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    if (view === 'test') return <GazeTest />;

    return (
        <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
            {cameraError && <CameraError />}

            {view === 'calibration' && (
                <div className="absolute inset-0">
                    {/* Subtle grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                    {/* Calibration dots */}
                    {dots.map((dot) => (
                        <button
                            key={dot.id}
                            onClick={() => handleClick(dot.id)}
                            disabled={dot.color === 'green'}
                            className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ${
                                dot.color === 'green'
                                    ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-default'
                                    : 'bg-rose-500/10 border-2 border-rose-500 hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.2)] cursor-pointer'
                            }`}
                            style={{ top: dot.y, left: dot.x, width: 36, height: 36 }}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${dot.color === 'green' ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
                            {dot.color !== 'green' && (
                                <span className="absolute text-[10px] font-bold text-rose-300 select-none">{5 - dot.clicks}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {view === 'modal' && <CalModal onTimerComplete={handleModalComplete} />}

            {/* Help button */}
            <div className="fixed bottom-6 right-6 z-[9998]">
                <button
                    className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 backdrop-blur text-slate-300 hover:text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition shadow-lg"
                    onClick={toggleInfo}
                >?</button>
            </div>

            {showInfo && view === 'calibration' && (
                <div className="fixed bottom-20 right-6 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-80 text-slate-200 z-[9998]">
                    <h4 className="font-bold text-lg mb-3 text-white">System Calibration</h4>
                    <div className="flex items-center justify-center mb-4 bg-slate-950/40 rounded-xl p-2">
                        <Lottie options={defaultOptions} height={120} width={120} />
                    </div>
                    <dl className="text-xs space-y-3 leading-relaxed">
                        <div>
                            <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-1">Step 1</dt>
                            <dd className="text-slate-300 font-light pl-2 border-l border-slate-700">
                                Wait for your camera to start — the video preview appears top-left.
                            </dd>
                        </div>
                        <div>
                            <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-1">Step 2</dt>
                            <dd className="text-slate-300 font-light pl-2 border-l border-slate-700">
                                Stare at each red dot and click it <strong>5 times</strong>. Repeat for all 9.
                            </dd>
                        </div>
                        <div>
                            <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-1">Goal</dt>
                            <dd className="text-slate-300 font-light pl-2 border-l border-slate-700">
                                All targets turn green → Gaze Assessment begins automatically.
                            </dd>
                        </div>
                    </dl>
                    <button
                        className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition duration-200"
                        onClick={toggleInfo}
                    >Start Calibration</button>
                </div>
            )}
        </div>
    );
};

export default CalibrationGrid;
