import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarMenu from '../components/NavbarMenu';
import Footer from './Footer';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        datejoined: '',
        isActive: '',
    });
    const [loading, setLoading] = useState(true); // Loader state
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // Success message

    // Fetch user profile data from the API
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true); // Start loading
            try {
                const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
                const token = localStorage.getItem('authToken');
                const apiUrl = process.env.REACT_APP_BACKEND_URL;
                const response = await fetch(
                    `${apiUrl}/api/getuser/?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setProfile({
                        username: data.username,
                        email: data.email,
                        datejoined: data.datejoined,
                        isActive: data.status ? 'Active' : 'Inactive',
                    });
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to load profile data');
                }
            } catch (err) {
                setError('An error occurred while fetching the profile data');
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchProfile();
    }, []);

    // Toggle edit mode
    const toggleEdit = () => setIsEditing(!isEditing);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Save updated profile to API
    const handleSave = async () => {
        setError(null);
        setMessage(null); // Reset messages

        if (!isValidEmail(profile.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsEditing(false);

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('authToken');
            const apiUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${apiUrl}/api/updateuser/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    username: profile.username,
                    email: profile.email,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message); // Display success message
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update profile');
            }
        } catch (err) {
            setError('An error occurred while updating the profile');
        }
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm("WARNING: Are you sure you want to permanently delete your profile? This will immediately and permanently delete your account, GAD-7 survey responses, and all gaze tracking logs. This action is irreversible and complies with HIPAA/PHI permanent data purging standards.")) {
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${apiUrl}/api/delete-profile/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('is_filled');
                if (localStorage.getItem('selectedCategory')) {
                    localStorage.removeItem('selectedCategory');
                }
                alert("Your profile and all clinical records have been permanently purged.");
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete profile');
            }
        } catch (err) {
            setError('An error occurred while deleting the profile');
        }
    };

    return (
        <div className="min-h-screen bg-theme-background flex flex-col relative select-none">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <NavbarMenu />

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center px-6 py-24 z-10">
                {loading ? (
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-dashed border-indigo-500/40 animate-spin mx-auto"></div>
                        <p className="text-lg text-slate-400 font-light">Retrieving clinical profile...</p>
                    </div>
                ) : (
                    <div className="max-w-lg w-full p-8 bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-3xl shadow-glass-card space-y-6">
                        <div className="text-center space-y-1 mb-4">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">User Space</span>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">Your Profile Account</h1>
                        </div>

                        {error && <p className="text-rose-400 text-xs text-center font-semibold bg-rose-500/10 py-2.5 rounded-xl border border-rose-500/20">{error}</p>}
                        {message && <p className="text-emerald-400 text-xs text-center font-semibold bg-emerald-500/10 py-2.5 rounded-xl border border-emerald-500/20">{message}</p>}

                        <div className="space-y-5">
                            {/* Username */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Username
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                                    />
                                ) : (
                                    <p className="text-slate-200 font-light text-sm pl-1 break-words bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl">
                                        {profile.username || "Not set"}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-white rounded-xl p-3 text-sm transition outline-none font-light placeholder:text-slate-600"
                                    />
                                ) : (
                                    <p className="text-slate-200 font-light text-sm pl-1 break-words bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl">
                                        {profile.email}
                                    </p>
                                )}
                            </div>

                            {/* Date Joined */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Member Since
                                </label>
                                <p className="text-slate-300 font-light text-sm pl-1 bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl">
                                    {profile.datejoined ? new Date(profile.datejoined).toLocaleDateString() : "N/A"}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Account Status
                                </label>
                                <div className="pl-1 flex items-center gap-2 bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl">
                                    <span className={`w-2.5 h-2.5 rounded-full ${profile.isActive === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                                    <span className="text-slate-300 font-light text-sm">{profile.isActive}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
                            <div>
                                {!isEditing && (
                                    <button
                                        onClick={handleDeleteProfile}
                                        className="py-2.5 px-4 border border-red-500/50 text-red-400 font-semibold rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-sm shadow-red-500/20 text-xs"
                                    >
                                        Delete Profile
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={toggleEdit}
                                            className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 font-semibold transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition duration-200 shadow-md shadow-indigo-600/10 text-sm"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={toggleEdit}
                                        className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition duration-200 shadow-md shadow-indigo-600/10 text-sm"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ProfilePage;
