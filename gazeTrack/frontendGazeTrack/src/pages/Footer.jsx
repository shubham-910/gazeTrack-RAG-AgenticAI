import React from "react";

const Footer = () => {
    return (
        <footer className="bg-slate-950/40 backdrop-blur-md border-t border-slate-900/80 text-slate-400 py-6 select-none z-10">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Brand */}
                    <div className="text-center md:text-left space-y-1">
                        <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">GazeTrack</h2>
                        <p className="text-[10px] text-slate-500 font-light leading-relaxed max-w-sm">
                            Retrain visual attention pathways and cognitive bias triggers through real-time feedback and structured AI CBT agents.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex justify-center space-x-6 text-xs font-light">
                        <a href="/home" className="text-slate-400 hover:text-white transition">Home</a>
                        <a href="/privacypolicy" className="text-slate-400 hover:text-white transition">Privacy Policy</a>
                        <a href="/about-us" className="text-slate-400 hover:text-white transition">About Us</a>
                    </div>
                </div>

                {/* Copyright info */}
                <div className="text-center text-[10px] text-slate-600 mt-6 pt-4 border-t border-slate-950/50 font-light">
                    <p>© {new Date().getFullYear()} GazeTrack by Persuasive Computing Lab. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
