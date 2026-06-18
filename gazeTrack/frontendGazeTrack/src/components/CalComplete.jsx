import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const CalComplete = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleSkip = () => {
    navigate("/home");
  };

  const handleContinue = () => {
    navigate("/permission"); // Updated route path for correct navigation flow
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="permission-comp bg-theme-background min-h-screen flex justify-center items-center relative px-6 select-none">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>

      <div className="relative bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card max-w-md w-full text-slate-100 z-10">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block text-center mb-1">Step 2 of 3</span>
        <h1 className="text-2xl font-extrabold text-center mb-6 text-white tracking-tight">Gaze Target Training</h1>

        {/* Dynamic SVG Animation representing calibration targets */}
        <div className="flex justify-center mb-8 bg-slate-950/30 rounded-2xl border border-slate-800/50 p-4">
          <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="#312e81" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '20s' }} />
            <circle cx="50" cy="50" r="35" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="2" />
            
            {/* Custom eye cursor path */}
            <path d="M25 50C25 50 35 32 50 32C65 32 75 50 75 50C75 50 65 68 50 68C35 68 25 50 25 50Z" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" />
            
            {/* Moving eye target dot */}
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; -12,0; 12,0; 0,0" keyTimes="0; 0.33; 0.66; 1" dur="5s" repeatCount="indefinite" />
              <circle cx="50" cy="50" r="6" fill="#ef4444" className="animate-pulse">
                <animate attributeName="fill" values="#ef4444;#ef4444;#10b981;#10b981;#ef4444" keyTimes="0;0.4;0.5;0.9;1" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="50" r="11" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2 2" className="animate-spin" />
            </g>
          </svg>
        </div>

        <div className="mb-8 text-center space-y-2">
          <p className="text-sm text-slate-200 font-semibold">
            Follow the red target dots across your screen.
          </p>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Hold your gaze steadily on each dot. Once it turns <span className="text-emerald-400 font-medium">green</span>, shift your focus to the next appearing dot.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 font-semibold transition duration-200 text-sm"
          >
            Skip to Home
          </button>
          <button
            onClick={handleContinue}
            className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition duration-200 text-sm shadow-md shadow-indigo-600/10"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Floating question mark button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 backdrop-blur text-slate-300 hover:text-white text-base w-10 h-10 rounded-xl flex items-center justify-center font-bold transition shadow-lg"
          onClick={toggleInfo}
        >
          ?
        </button>
      </div>

      {/* Info message modal */}
      {showInfo && (
        <div className="fixed bottom-20 right-6 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-80 text-slate-200 z-30 transition-all duration-300">
          <h4 className="font-bold text-lg mb-3 text-white">Why Calibrate?</h4>
          <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
            We use temporary webcam eye-tracking markers to map screen pixels to your gaze vectors. No images or videos are ever uploaded or stored.
          </p>
          <button
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition duration-200 shadow-md shadow-indigo-600/10"
            onClick={toggleInfo}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CalComplete;
