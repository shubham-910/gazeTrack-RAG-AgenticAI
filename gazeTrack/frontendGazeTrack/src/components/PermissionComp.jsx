import React from "react";
import { useNavigate } from "react-router-dom"; 
import { MdArrowBackIos } from "react-icons/md";

const PermissionComp = () => {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/home");
    };

    const handleContinue = () => {
        navigate("/calibration");
    };

    const handleCategorySelection = () => {
        navigate("/category");
    };

    return (
        <div className="permission-comp bg-theme-background min-h-screen flex flex-col items-center justify-center px-6 select-none relative">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

            <div className="w-full max-w-md space-y-4 z-10">
                {/* Back to Category Link */}
                <div 
                    className="text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1.5 transition select-none font-medium uppercase tracking-wider pl-1"
                    onClick={handleCategorySelection}
                >
                    <MdArrowBackIos className="text-[10px]" />
                    <span>Back to Category</span>
                </div>

                {/* Permission Box */}
                <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card text-slate-100">
                    
                    {/* Animated Shutter SVG */}
                    <div className="flex justify-center mb-6 bg-slate-950/30 rounded-2xl border border-slate-800/50 p-4">
                        <svg className="w-24 h-24 text-indigo-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 5" className="animate-spin" style={{ animationDuration: '12s' }} />
                            <circle cx="50" cy="50" r="30" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="4" />
                            
                            {/* Shutter blades */}
                            <path d="M50 20 L50 35 M50 80 L50 65 M20 50 L35 50 M80 50 L65 50" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="50" cy="50" r="16" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" strokeWidth="1.5" />
                            <circle cx="50" cy="50" r="6" fill="#10b981" className="animate-pulse" />
                        </svg>
                    </div>

                    <div className="mb-6 text-center space-y-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 3 of 3</span>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">Camera Permission</h1>
                        <p className="text-xs text-slate-400 font-light leading-relaxed">
                            We request temporary browser access to your device camera to isolate gaze vectors and track ocular movements.
                        </p>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-4 mb-6">
                        {/* Cancel Button */}
                        <button 
                            className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 font-semibold transition duration-200 text-sm"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        {/* Continue Button */}
                        <button 
                            className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition duration-200 text-sm shadow-md shadow-indigo-600/10"
                            onClick={handleContinue}
                        >
                            Allow & Continue
                        </button>
                    </div>

                    {/* Privacy Note */}
                    <div className="pt-4 border-t border-slate-800/60">
                        <p className="text-[10px] text-slate-500 font-light leading-relaxed flex items-center justify-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            HIPAA Compliant: Camera feeds are processed strictly client-side inside the local sandbox. No video frames are ever recorded or transmitted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionComp;
