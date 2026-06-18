import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import * as AnimationDot from "../assets/AnimationDot.json";

const CalMainComp = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleContinue = () => {
    navigate("/calibrate");
  };

  const handleChangeCategory = () => {
    navigate("/category");
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: AnimationDot.default,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="bg-theme-background min-h-screen flex justify-center items-center relative px-6 select-none">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>

      <div className="relative bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card max-w-md w-full text-slate-100 z-10">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block text-center mb-1">Pre-Assessment</span>
        <h1 className="text-2xl font-extrabold text-center mb-6 text-white tracking-tight">Calibration Exercise</h1>

        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 flex items-center justify-center relative bg-slate-950/30 rounded-2xl border border-slate-800/50">
            <div className="absolute w-28 h-28 rounded-full border border-indigo-500/20 animate-ping"></div>
            <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-indigo-400/40 animate-spin"></div>
            <div className="absolute w-12 h-12 rounded-full border border-emerald-500/30 animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse"></div>
          </div>
        </div>

        <div className="mb-8 text-center space-y-2">
          <p className="text-sm text-slate-200 font-semibold">
            Follow the glowing target dots with your mouse and gaze.
          </p>
          <p className="text-xs text-slate-400 font-light">
            Click the <strong className="text-indigo-400 font-semibold">?</strong> button at any time for visual calibration guidelines.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleChangeCategory}
            className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700/50 font-semibold transition duration-200 text-sm"
          >
            Change Category
          </button>
          <button
            onClick={handleContinue}
            className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition duration-200 text-sm shadow-md shadow-indigo-600/10"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Floating Info Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 backdrop-blur text-slate-300 hover:text-white text-base w-10 h-10 rounded-xl flex items-center justify-center font-bold transition shadow-lg"
          onClick={toggleInfo}
        >
          ?
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed bottom-20 right-6 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-80 text-slate-200 z-30 transition-all duration-300">
          <h4 className="font-bold text-lg mb-3 text-white">Calibration Instructions</h4>

          <div className="flex items-center justify-center mb-4 bg-slate-950/40 rounded-xl p-2">
            <Lottie options={defaultOptions} height={120} width={120} />
          </div>

          <dl className="text-xs space-y-3 leading-relaxed">
            <div>
              <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-1">Step 1</dt>
              <dd className="text-slate-300 font-light pl-2 border-l border-slate-700">
                Click on each red target 5 times with your gaze and mouse until it turns green.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-1">Step 2</dt>
              <dd className="text-slate-300 font-light pl-2 border-l border-slate-700">
                Once a target turns green, move to the next.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-1">Step 3</dt>
              <dd className="text-slate-300 font-light pl-2 border-l border-slate-700">
                After calibration finishes, you can navigate without utilizing mouse coordinates.
              </dd>
            </div>
          </dl>

          <button
            className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition duration-200 shadow-md shadow-indigo-600/10"
            onClick={toggleInfo}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
};

export default CalMainComp;
