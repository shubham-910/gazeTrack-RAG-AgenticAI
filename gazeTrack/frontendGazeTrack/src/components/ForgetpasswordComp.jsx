import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgetpasswordComp = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email format. Please use name@domain.com.');
            return false;
        } else {
            setEmailError('');
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = process.env.REACT_APP_BACKEND_URL;

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            await axios.post(
                `${apiUrl}/api/sendresetlink/`,
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success("Reset password link sent successfully.");
            toast.info("Check your inbox and close this page.");
        } catch (error) {
            toast.error("Error sending reset link. Please try again.");
        }
    };

    return (
        <div className="forgetpass bg-theme-background min-h-screen flex justify-center items-center px-6 relative select-none">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800/80 p-8 shadow-glass-card hover:border-slate-700/60 transition duration-300 z-10">
                <div className="space-y-6">
                    <div className="text-center">
                        {/* Animated Vector Lock Graphic */}
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                <circle cx="12" cy="16" r="1.5" className="animate-pulse fill-indigo-400" />
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password</h2>
                        <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                            Enter your email below. We'll verify your credentials and send a password reset link to your inbox.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => validateEmail(email)}
                                required 
                                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                                placeholder="name@example.com" 
                            />
                            {emailError && (
                                <p className="text-rose-400 text-xs mt-1.5 font-light pl-1">{emailError}</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-3 rounded-xl transition duration-300 transform hover:-translate-y-0.5 text-sm shadow-md shadow-indigo-600/10 ${
                                emailError || !email ? 'opacity-40 cursor-not-allowed transform-none' : ''
                            }`}
                            disabled={!!emailError || !email}
                        >
                            Send Reset Link
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-400 font-light">
                            Remember your account?{" "}
                            <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetpasswordComp;
