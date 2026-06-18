import React, { useEffect, useState } from 'react';

const CalModal = ({ onTimerComplete }) => {
    const [secondsLeft, setSecondsLeft] = useState(10);
    const totalDuration = 10;

    useEffect(() => {
        if (secondsLeft > 0) {
            const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (onTimerComplete) {
            onTimerComplete(); // Trigger the callback when the timer ends
        }
    }, [secondsLeft, onTimerComplete]);

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (secondsLeft / totalDuration) * circumference;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 p-6 select-none animate-fade-in">
            <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl flex flex-col items-center">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Calibration Complete</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Congratulations!</h2>
                <p className="text-xs text-slate-400 font-light mb-6">
                    Your eye patterns have been registered. Sit back and relax—no need to click or move your mouse.
                </p>

                {/* Animated Circular Countdown Timer */}
                <div className="flex justify-center mb-6 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="rgba(99, 102, 241, 0.1)"
                            strokeWidth="4"
                            fill="transparent"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="#6366f1"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))' }}
                        />
                    </svg>
                    {/* Centered Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-white">{secondsLeft}</span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-500">Secs</span>
                    </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 font-light">
                    <p>
                        You will be presented with <strong className="text-indigo-400 font-semibold">3 pairs of stimuli photos</strong>.
                    </p>
                    <p className="text-slate-400">
                        Each pair will display for 15 seconds. Ensure your camera view remains unobstructed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalModal;
