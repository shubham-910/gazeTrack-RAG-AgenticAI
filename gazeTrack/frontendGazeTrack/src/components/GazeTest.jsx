import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import mediapipeService from '../utils/mediapipeService';

const GazeTest = () => {
    const [pairs, setPairs]                         = useState([]);
    const [currentPair, setCurrentPair]             = useState(null);
    const [countdown, setCountdown]                 = useState(15);
    const [loading, setLoading]                     = useState(false);
    const [loadingCountdown, setLoadingCountdown]   = useState(3);
    // eslint-disable-next-line no-unused-vars
    const [currentIndex, setCurrentIndex]           = useState(0);
    const [xCoordinates, setXCoordinates]           = useState([]);
    const [finalizing, setFinalizing]               = useState(false);

    const intervalRef = useRef(null);
    const navigate    = useNavigate();

    // ── Fetch image pairs ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPairs = async () => {
            try {
                const apiUrl = process.env.REACT_APP_BACKEND_URL;
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${apiUrl}/api/getstimulis/`, {
                    params: { category_number: localStorage.getItem('selectedCategory') },
                    headers: { Authorization: `Token ${token}` },
                });
                if (response.data.pairs.length > 0) {
                    setPairs(response.data.pairs);
                    setCurrentPair(response.data.pairs[0]);
                } else {
                    toast.error('No pairs available for this category.');
                }
            } catch (error) {
                console.error('Error fetching pairs:', error);
                toast.error('Failed to load test stimuli. Please try again.');
            }
        };
        fetchPairs();
    }, []);

    // ── Collect x-coordinates via mediapipe predictions ──────────────────────
    useEffect(() => {
        if (currentPair) {
            intervalRef.current = setInterval(() => {
                const prediction = mediapipeService.getPrediction();
                if (prediction && prediction.x !== null && prediction.x !== undefined) {
                    setXCoordinates(prev => [...prev, prediction.x]);
                }
            }, 30); // Poll gaze coordinates matching standard webcam frame-rate (approx 33fps)
        }
        return () => clearInterval(intervalRef.current);
    }, [currentPair]);

    // Ensure camera stream is shut down when test component unmounts
    useEffect(() => {
        return () => {
            mediapipeService.stopStream();
            mediapipeService.clearCalibrationData();
        };
    }, []);
    // ── 15-second countdown per pair ──────────────────────────────────────────
    useEffect(() => {
        if (currentPair && !loading) {
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setLoading(true);
                        setCountdown(15);
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [currentPair, loading]);

    // ── 3-second gap between pairs ────────────────────────────────────────────
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingCountdown(prev => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setLoading(false);
                        setLoadingCountdown(3);

                        setCurrentIndex(prevIndex => {
                            const nextIndex = prevIndex + 1;
                            if (nextIndex < pairs.length) {
                                setCurrentPair(pairs[nextIndex]);
                            } else {
                                setFinalizing(true);
                                sendXCoordinates();
                            }
                            return nextIndex;
                        });
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, pairs, navigate]);

    // ── Send accumulated x-coordinates and navigate to result ────────────────
    const sendXCoordinates = useCallback(async () => {
        try {
            const apiUrl         = process.env.REACT_APP_BACKEND_URL;
            const userId         = localStorage.getItem('userId');
            const categoryNumber = localStorage.getItem('selectedCategory');
            const token          = localStorage.getItem('authToken');

            console.log('[GazeTest] POST /api/prediction/ with', xCoordinates.length, 'points');
            const predictionResponse = await axios.post(
                `${apiUrl}/api/prediction/`,
                { 
                    x: xCoordinates, 
                    user_id: userId, 
                    category_number: categoryNumber,
                    screen_width: window.innerWidth 
                },
                { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' } }
            );

            const { final_prediction, test_date, left_count, right_count, id } = predictionResponse.data;
            console.log(`[GazeTest] Prediction: ${final_prediction}, L=${left_count}, R=${right_count}`);

            console.log('[GazeTest] POST /api/generate/');
            const generationResponse = await axios.post(
                `${apiUrl}/api/generate/`,
                { user_id: userId, prediction_id: id },
                { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' } }
            );

            const { llm_fetch_response, techniques, next_steps } = generationResponse.data;
            console.log('[GazeTest] LLM feedback received.');

            // Shutdown MediaPipe Stream
            mediapipeService.stopStream();
            mediapipeService.clearCalibrationData();

            setXCoordinates([]);
            setFinalizing(false);
            toast.info('Gaze Test completed.');

            navigate('/result', {
                state: {
                    prediction:       final_prediction,
                    testDate:         test_date,
                    leftCount:        left_count,
                    rightCount:       right_count,
                    techniquesRes:    techniques,
                    next_steps,
                    llm_fetch_response,
                },
            });
        } catch (error) {
            console.error('[GazeTest] Submission error:', error);
            setFinalizing(false);
            toast.error('Failed to complete gaze test. Please try again.');
        }
    }, [xCoordinates, navigate]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-6 py-12 relative select-none overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

            {finalizing ? (
                /* ── Analyzing screen ── */
                <div className="flex flex-col items-center z-10 text-center space-y-4">
                    <div
                        className="w-16 h-16 rounded-full border-4 border-dashed border-indigo-500 animate-spin mb-2"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.4))' }}
                    />
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">Analyzing Attentional Bias...</h2>
                    <p className="text-xs text-slate-400 font-light max-w-xs leading-relaxed">
                        {xCoordinates.length} gaze points collected — generating your CBT report.
                    </p>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center justify-center z-10">
                    {currentPair && !loading ? (
                        /* ── Image pair ── */
                        <div className="flex w-full max-w-5xl gap-8 sm:gap-10 justify-center">
                            <div className="w-1/2 relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                                <img
                                    src={currentPair.negative_image.image_metadata}
                                    alt="stimuli 1"
                                    className="relative w-full h-[65vh] object-cover rounded-2xl border-2 border-slate-800/80 shadow-2xl"
                                    loading="lazy"
                                />
                            </div>
                            <div className="w-1/2 relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-l from-emerald-500/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                                <img
                                    src={currentPair.positive_image.image_metadata}
                                    alt="stimuli 2"
                                    className="relative w-full h-[65vh] object-cover rounded-2xl border-2 border-slate-800/80 shadow-2xl"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    ) : (
                        /* ── Between-pair loading screen ── */
                        <div className="flex flex-col items-center justify-center space-y-4 h-[65vh]">
                            <div className="w-12 h-12 rounded-full border-4 border-dashed border-indigo-500/40 animate-spin" />
                            <h2 className="text-xl font-extrabold text-white">
                                {loading ? `Next scene in ${loadingCountdown}s` : 'Preparing session...'}
                            </h2>
                        </div>
                    )}

                    {/* Countdown badge */}
                    {!loading && currentPair && (
                        <div className="mt-6 bg-slate-900/60 border border-slate-800 backdrop-blur px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <p className="text-xs text-slate-300 font-light tracking-wide uppercase">
                                Time Remaining: <span className="font-bold text-white text-sm ml-1">{countdown}s</span>
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/home')}
                        className="mt-8 py-2.5 px-8 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl font-semibold transition duration-200 text-sm shadow-md"
                    >
                        Cancel Session
                    </button>
                </div>
            )}
        </div>
    );
};

export default GazeTest;
