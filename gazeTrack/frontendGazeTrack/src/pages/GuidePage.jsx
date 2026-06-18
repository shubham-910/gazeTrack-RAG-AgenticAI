import React from 'react';
import NavbarMenu from '../components/NavbarMenu';
import Footer from './Footer';

const GuidePage = () => {
  return (
    <div className="min-h-screen bg-theme-background text-slate-100 flex flex-col justify-between relative select-none">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <NavbarMenu />

      {/* Main content container */}
      <div className="container mx-auto px-6 pt-28 pb-16 z-10 max-w-4xl flex-grow">
        
        {/* Header */}
        <header className="text-center mb-12 space-y-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">User Guide</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            How to Use GazeTrack
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
            Understand how to navigate our spatial modification sessions to retrain attention focus and improve mental well-being.
          </p>
        </header>

        {/* Dynamic Vector Radar Animation representing mapping */}
        <div className="flex justify-center mb-12 bg-slate-950/20 border border-slate-800/50 p-6 rounded-3xl max-w-sm mx-auto shadow-inner">
          <svg className="w-40 h-40 text-indigo-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="42" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" />
            <circle cx="50" cy="50" r="32" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
            
            {/* Connected mesh nodes */}
            <g className="animate-pulse">
              <circle cx="30" cy="40" r="3" fill="#6366f1" />
              <circle cx="70" cy="38" r="3.5" fill="#10b981" />
              <circle cx="50" cy="72" r="4.5" fill="#6366f1" />
            </g>
            <path d="M30 40 L50 72 L70 38 M30 40 L70 38" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            
            {/* Scanning radar line */}
            <line x1="50" y1="50" x2="50" y2="8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" className="origin-center animate-spin" style={{ animationDuration: '7s' }} />
          </svg>
        </div>

        {/* Steps Grid */}
        <section className="mb-16 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight border-l-4 border-indigo-500 pl-3">Session Guide Steps</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-glass-card flex-1 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 01</span>
              <h3 className="text-base font-bold text-white tracking-tight">Anxiety Assessment</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Log in and take the baseline GAD-7 anxiety survey. Your score helps the Gaze CBT Agent customize target parameters.
              </p>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-glass-card flex-1 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 02</span>
              <h3 className="text-base font-bold text-white tracking-tight">Camera Calibration</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Stare at each red coordinate target and click it 5 times until it turns green to calibrate the local eye-tracking engine vectors.
              </p>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-glass-card flex-1 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 03</span>
              <h3 className="text-base font-bold text-white tracking-tight">Observation Session</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Observe the stimulus slides for 15s. The backend service calculates spatial offsets and triggers the clinical LLM response logs.
              </p>
            </div>
          </div>
        </section>

        {/* Features Callout */}
        <section className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Key Features</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 font-light">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Subconscious spatial gaze mapping coordinates</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Secure, server-side Google Gemini CBT Agent feedback</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Real-time results visualization metrics</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Fully local camera rendering respecting HIPAA privacy</span>
            </li>
          </ul>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default GuidePage;
