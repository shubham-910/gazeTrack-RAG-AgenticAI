import React from 'react';

const CameraError = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm z-50 p-6 select-none">
            <div className="bg-slate-900/90 border border-rose-500/30 backdrop-blur-md p-8 rounded-3xl shadow-[0_0_35px_rgba(239,68,68,0.15)] max-w-sm w-full text-center flex flex-col items-center">
                
                {/* Warning SVG Icon */}
                <div className="w-24 h-24 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 0 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-8.426c0-1.066-.75-1.993-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 0-1.64-1.055l-.822-1.316A2.192 2.192 0 0 0 15.18 3h-6.36a2.192 2.192 0 0 0-1.847 1.086L6.827 6.175ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <line x1="3" y1="3" x2="21" y2="21" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-2">Hardware Required</span>
                <h2 className="text-xl font-extrabold text-white tracking-tight mb-3">Camera Access Blocked</h2>
                <p className="text-xs text-slate-400 font-light leading-relaxed mb-6">
                    Please ensure a webcam is connected, active, and that you have granted permission for this site to access it.
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 rounded-xl text-xs font-semibold transition duration-200"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
};

export default CameraError;
