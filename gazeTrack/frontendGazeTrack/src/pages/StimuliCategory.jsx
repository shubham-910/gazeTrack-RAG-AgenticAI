import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import nature from '../assets/nature.jpg';
import maleFace from '../assets/maleFace.jpg';
import femaleFace from '../assets/femaleFace.jpg';

const StimuliCategory = () => {
    const navigate = useNavigate();
    const [showInfo, setShowInfo] = useState(false);

    const categories = [
        { id: 1, name: "Nature Pictures", image: nature },
        { id: 2, name: "Male Faces", image: maleFace },
        { id: 3, name: "Female Faces", image: femaleFace },
    ];

    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleSelectCategory = (id) => {
        setSelectedCategory(id);
    };

    const toggleInfo = () => {
        setShowInfo(!showInfo);
    };

    const handleProceed = () => {
        if (selectedCategory !== null) {
            localStorage.setItem('selectedCategory', selectedCategory); // Save selected category to local storage
            navigate('/permission');
        } else {
            toast.error('Please select one category.');
        }
    };

    const handleHome = () => {
        navigate('/home'); // Redirect to the home page
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-theme-background p-6 relative select-none">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="text-center space-y-2 mb-10 z-10">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Step 1 of 3</span>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                    Select a Stimuli Category
                </h1>
                <p className="text-xs text-slate-400 font-light max-w-sm mx-auto">
                    The category you select determines the pairs of visual images that will be presented during the gaze session.
                </p>
            </div>

            {/* Categories cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl z-10">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onClick={() => handleSelectCategory(category.id)}
                        className={`p-4 bg-slate-900/60 rounded-2xl shadow-glass-card cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-glass-card-glow border-2 ${
                            selectedCategory === category.id 
                                ? 'border-indigo-500 scale-105 shadow-glass-card-glow' 
                                : 'border-slate-800/80 hover:border-slate-700/60'
                        }`}
                    >
                        <img 
                            src={category.image} 
                            alt={category.name} 
                            className="w-full h-44 object-cover mb-4 rounded-xl shadow-inner border border-slate-950/20" 
                            loading="lazy" 
                        />
                        <h2 className={`text-center font-bold tracking-tight text-sm ${selectedCategory === category.id ? 'text-white' : 'text-slate-300'}`}>
                            {category.name}
                        </h2>
                    </div>
                ))}
            </div>

            {/* Disclaimer text */}
            <div className="mt-8 text-center max-w-2xl px-6 py-4 bg-slate-950/20 border border-slate-850 rounded-2xl z-10">
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    <strong className="text-slate-300 font-bold uppercase tracking-wider text-[9px] mr-1">Disclaimer:</strong> 
                    The stimuli datasets displayed on this site are solely for cognitive research and attention bias studies. 
                    We do not endorse or promote any form of visual bias or categorization. The content is intended to foster inclusive data ethics.
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4 mt-8 z-10">
                <button
                    onClick={handleHome}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-8 rounded-xl transition text-sm border border-slate-700/50"
                >
                    Dashboard Home
                </button>
                <button
                    onClick={handleProceed}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-8 rounded-xl transition text-sm shadow-md shadow-indigo-600/10"
                >
                    Continue
                </button>
            </div>

            {/* Floating help button */}
            <div className="fixed bottom-6 right-6 z-20">
                <button
                    className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 backdrop-blur text-slate-300 hover:text-white text-base w-10 h-10 rounded-xl flex items-center justify-center font-bold transition shadow-lg"
                    onClick={toggleInfo}
                >
                    ?
                </button>
            </div>

            {/* Help Info Modal */}
            {showInfo && (
                <div className="fixed bottom-20 right-6 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-80 text-slate-200 z-30 transition-all duration-300">
                    <h4 className="font-bold text-center text-base mb-3 text-white">Category Guide</h4>
                    <dl className="text-xs text-slate-400 leading-relaxed space-y-3">
                        <div>
                            <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-0.5">Selection</dt>
                            <dd className="pl-2 border-l border-slate-750 font-light">
                                Select one of the three available stimulus types depending on your study bias targets.
                              </dd>
                        </div>
                        <div>
                            <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-0.5">Lock-in</dt>
                            <dd className="pl-2 border-l border-slate-750 font-light">
                                The stimuli category is locked for the duration of the gaze session once you click continue.
                            </dd>
                        </div>
                        <div>
                            <dt className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] mb-0.5">Flow</dt>
                            <dd className="pl-2 border-l border-slate-750 font-light">
                                Nature pictures focus on environmental colors, while faces represent social attentional mapping patterns.
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

export default StimuliCategory;
