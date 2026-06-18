import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginComp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [passwordRules, setPasswordRules] = useState({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
    });
    const [isFormValid, setIsFormValid] = useState(false);

    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const navigate = useNavigate();

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email format (e.g. name@domain.com)');
            return false;
        } else {
            setEmailError('');
            return true;
        }
    };

    // Password validation
    const validatePassword = (password) => {
        const rules = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        setPasswordRules(rules);
        return Object.values(rules).every(rule => rule === true);
    };

    useEffect(() => {
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        setIsFormValid(isEmailValid && isPasswordValid);
    }, [email, password]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error('Please resolve validation requirements.');
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await axios.post(
                `${apiUrl}/api/login/`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userId', response.data.user_id);
            localStorage.setItem('is_filled', response.data.is_filled);

            toast.success('Login successful!');
            navigate('/home');
        } catch (error) {
            setError('Invalid credentials or network failure');
            toast.error('Invalid credentials or network failure');
        }
    };

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800/80 p-8 shadow-glass-card hover:border-slate-700/60 transition duration-300">
            <div className="space-y-6">
                <div>
                    <div className="flex justify-center mb-4">
                        <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" className="fill-indigo-500/20 stroke-indigo-400" />
                            <circle cx="12" cy="12" r="1" className="fill-emerald-400 stroke-emerald-400 animate-pulse" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight text-center">
                        Welcome Back
                    </h2>
                    <p className="text-xs text-slate-400 text-center mt-1.5 font-light">
                        Sign in to monitor your Gaze Cognitive feedback
                    </p>
                </div>
                
                {error && <p className="text-rose-400 text-xs text-center font-semibold bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            onBlur={() => setIsEmailTouched(true)}
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                            placeholder="name@example.com"
                        />
                        {isEmailTouched && emailError && <p className="text-rose-400 text-xs mt-1.5 font-light pl-1">{emailError}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                            <a href="/forgetpassword" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                validatePassword(e.target.value);
                            }}
                            onFocus={() => setIsPasswordTouched(true)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                        />

                        {/* Animated Rules Checklist */}
                        {isPasswordTouched && (
                            <ul className="text-xs mt-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/40 space-y-1.5 font-light">
                                <li className={`flex items-center gap-2 ${passwordRules.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-sm">{passwordRules.minLength ? '✓' : '•'}</span> Minimum 8 characters
                                </li>
                                <li className={`flex items-center gap-2 ${passwordRules.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-sm">{passwordRules.uppercase ? '✓' : '•'}</span> At least one uppercase letter
                                </li>
                                <li className={`flex items-center gap-2 ${passwordRules.lowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-sm">{passwordRules.lowercase ? '✓' : '•'}</span> At least one lowercase letter
                                </li>
                                <li className={`flex items-center gap-2 ${passwordRules.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-sm">{passwordRules.number ? '✓' : '•'}</span> At least one number
                                </li>
                                <li className={`flex items-center gap-2 ${passwordRules.specialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-sm">{passwordRules.specialChar ? '✓' : '•'}</span> At least one special character
                                </li>
                            </ul>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-3 rounded-xl transition duration-300 transform hover:-translate-y-0.5 text-sm shadow-md shadow-indigo-600/10 ${
                            isFormValid ? '' : 'opacity-40 cursor-not-allowed transform-none'
                        }`}
                        disabled={!isFormValid}
                    >
                        Sign In
                    </button>

                    <p className="text-xs text-slate-400 text-center font-light mt-4">
                        Don’t have an account yet? <a href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginComp;
