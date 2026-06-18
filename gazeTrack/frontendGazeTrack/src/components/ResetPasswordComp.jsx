import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPasswordComp = () => {
    const [newPassword, setNewPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});
    const [retypePasswordError, setRetypePasswordError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const { userId, token } = useParams();
    const navigate = useNavigate();

    // Password validation function
    const validatePassword = (password) => {
        const errors = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        setPasswordErrors(errors);
        const isValid = Object.values(errors).every(Boolean);
        setIsPasswordValid(isValid);
        return isValid;
    };

    // Check if passwords match
    const validateRetypePassword = (password, retypePassword) => {
        if (password !== retypePassword) {
            setRetypePasswordError("Passwords do not match.");
            return false;
        } else {
            setRetypePasswordError('');
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid || !validateRetypePassword(newPassword, retypePassword)) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        const apiUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            await axios.post(
                `${apiUrl}/api/resetPassword/${userId}/${token}/`,
                { new_password: newPassword, retype_password: retypePassword },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            toast.success("Password reset successfully.");
            navigate('/login');
        } catch (error) {
            toast.error("Failed to reset password. Please try again.");
        }
    };

    return (
        <div className="reset-pass bg-theme-background min-h-screen flex justify-center items-center px-6 relative select-none">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800/80 p-8 shadow-glass-card hover:border-slate-700/60 transition duration-300 z-10">
                <div className="space-y-6">
                    <div className="text-center">
                        {/* Custom Lock SVG Graphic */}
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-indigo-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                <path d="M12 15v3" strokeLinecap="round" />
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
                        <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                            Create a secure password. Make sure it satisfies all the rules shown below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="new_password" className="block mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                New Password
                            </label>
                            <input 
                                type="password"
                                id="new_password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}
                                onFocus={() => setIsPasswordTouched(true)}
                                required
                                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                            {/* Password Validation Messages */}
                            {isPasswordTouched && (
                                <ul className="text-[11px] mt-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/40 space-y-1.5 font-light">
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
                            <label htmlFor="retype_password" className="block mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Retype New Password
                            </label>
                            <input 
                                type="password"
                                id="retype_password"
                                value={retypePassword}
                                onChange={(e) => {
                                    setRetypePassword(e.target.value);
                                    validateRetypePassword(newPassword, e.target.value);
                                }}
                                required
                                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                            {retypePasswordError && (
                                <p className="text-rose-400 text-xs mt-1.5 font-light pl-1">{retypePasswordError}</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-3 rounded-xl transition duration-300 transform hover:-translate-y-0.5 text-sm shadow-md shadow-indigo-600/10 ${
                                !isPasswordValid || retypePasswordError ? 'opacity-40 cursor-not-allowed transform-none' : ''
                            }`}
                            disabled={!isPasswordValid || !!retypePasswordError}
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordComp;
