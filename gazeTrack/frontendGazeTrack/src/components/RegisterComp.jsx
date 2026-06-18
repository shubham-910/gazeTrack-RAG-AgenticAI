import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterComp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [error, setError] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});
    const [retypePasswordError, setRetypePasswordError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);
    const [isRetypePasswordTouched, setIsRetypePasswordTouched] = useState(false);

    const navigate = useNavigate();

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

    const validatePassword = (password) => {
        const errors = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        setPasswordErrors(errors);
        return Object.values(errors).every(Boolean);
    };

    const validateRetypePassword = (password, retypePassword) => {
        if (password !== retypePassword) {
            setRetypePasswordError("Passwords do not match.");
            return false;
        } else {
            setRetypePasswordError('');
            return true;
        }
    };

    useEffect(() => {
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isRetypePasswordValid = validateRetypePassword(password, retypePassword);
        setIsFormValid(isEmailValid && isPasswordValid && isRetypePasswordValid);
    }, [email, password, retypePassword]);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Please satisfy all field validation rules.");
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_BACKEND_URL;
            await axios.post(
                `${apiUrl}/api/register/`,
                { name, email, password, retypePassword },
                { headers: { 'Content-Type': 'application/json' } }
            );
            navigate('/login');
            toast.success('Registration successful! Please sign in.');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Check inputs.');
            toast.error(error.response?.data?.message || 'Registration failed. Check inputs.');
        }
    };

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800/80 p-8 shadow-glass-card hover:border-slate-700/60 transition duration-300">
            <div className="space-y-5">
                <div>
                    <div className="flex justify-center mb-4">
                        <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" className="fill-indigo-500/20 stroke-indigo-400" />
                            <circle cx="12" cy="12" r="1" className="fill-emerald-400 stroke-emerald-400 animate-pulse" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight text-center">
                        Create Account
                    </h2>
                    <p className="text-xs text-slate-400 text-center mt-1.5 font-light">
                        Sign up to begin your attentional modification sessions
                    </p>
                </div>

                {error && <p className="text-rose-400 text-xs text-center font-semibold bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

                <form className="space-y-4" onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="name" className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                            placeholder="John Doe" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email address</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setIsEmailTouched(true);
                                validateEmail(e.target.value);
                            }}
                            onBlur={() => setIsEmailTouched(true)}
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                            placeholder="name@gmail.com" 
                            required 
                        />
                        {isEmailTouched && emailError && <p className="text-rose-400 text-xs mt-1 font-light pl-1">{emailError}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setIsPasswordTouched(true);
                                validatePassword(e.target.value);
                            }}
                            onFocus={() => setIsPasswordTouched(true)}
                            placeholder="••••••••" 
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                            required 
                        />

                        {isPasswordTouched && (
                            <ul className="text-[11px] mt-2.5 bg-slate-950/30 rounded-xl p-3 border border-slate-800/40 space-y-1 font-light">
                                <li className={`flex items-center gap-2 ${passwordErrors.minLength ? "text-emerald-400" : "text-slate-500"}`}>
                                    <span>{passwordErrors.minLength ? '✓' : '•'}</span> Minimum 8 characters
                                </li>
                                <li className={`flex items-center gap-2 ${passwordErrors.uppercase ? "text-emerald-400" : "text-slate-500"}`}>
                                    <span>{passwordErrors.uppercase ? '✓' : '•'}</span> At least one uppercase letter
                                </li>
                                <li className={`flex items-center gap-2 ${passwordErrors.lowercase ? "text-emerald-400" : "text-slate-500"}`}>
                                    <span>{passwordErrors.lowercase ? '✓' : '•'}</span> At least one lowercase letter
                                </li>
                                <li className={`flex items-center gap-2 ${passwordErrors.number ? "text-emerald-400" : "text-slate-500"}`}>
                                    <span>{passwordErrors.number ? '✓' : '•'}</span> At least one number
                                </li>
                                <li className={`flex items-center gap-2 ${passwordErrors.specialChar ? "text-emerald-400" : "text-slate-500"}`}>
                                    <span>{passwordErrors.specialChar ? '✓' : '•'}</span> At least one special character
                                </li>
                            </ul>
                        )}
                    </div>

                    <div>
                        <label htmlFor="retype-password" className="block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Re-type Password</label>
                        <input 
                            type="password" 
                            name="retype-password" 
                            id="retype-password" 
                            value={retypePassword}
                            onChange={(e) => {
                                setRetypePassword(e.target.value);
                                setIsRetypePasswordTouched(true);
                                validateRetypePassword(password, e.target.value);
                            }}
                            onFocus={() => setIsRetypePasswordTouched(true)}
                            placeholder="••••••••" 
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                            required 
                        />
                        {isRetypePasswordTouched && retypePasswordError && <p className="text-rose-400 text-xs mt-1 font-light pl-1">{retypePasswordError}</p>}
                    </div>
                    
                    <button 
                        type="submit" 
                        className={`w-full mt-2 text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-3 rounded-xl transition duration-300 transform hover:-translate-y-0.5 text-sm shadow-md shadow-indigo-600/10 ${
                            isFormValid ? '' : 'opacity-40 cursor-not-allowed transform-none'
                        }`}
                        disabled={!isFormValid} 
                    >
                        Register
                    </button>
                    
                    <p className="text-xs text-slate-400 text-center font-light mt-4">
                        Have an account? <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">Sign In</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterComp;
