import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const GadForm = () => {
    const [formValues, setFormValues] = useState({
        question_1: 0,
        question_2: 0,
        question_3: 0,
        question_4: 0,
        question_5: 0,
        question_6: 0,
        question_7: 0,
        user_id: localStorage.getItem('userId'),
        difficulty: '',
        is_filled: 1
    });

    const [flagValue, setFlagValue] = useState(false);
    const [totalScore, setTotalScore] = useState(null);
    const [anxietyMessage, setAnxietyMessage] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const isFilled = localStorage.getItem("is_filled");
        setFlagValue(isFilled === '1');  
    }, []);

    useEffect(() => {
        const fetchGadResponse = async () => {
            const token = localStorage.getItem('authToken');
            const apiUrl = process.env.REACT_APP_BACKEND_URL;
            const userId = localStorage.getItem('userId');

            try {
                const response = await axios.get(
                    `${apiUrl}/api/getgadform/${userId}/`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                const data = response.data;
                if (data.total_score !== undefined) {
                    localStorage.setItem("score", data.total_score);
                    setTotalScore(data.total_score);
                    setAnxietyMessage(getAnxietyMessage(data.total_score));
                    setFlagValue(true);
                }
            } catch (error) {
                console.error("Failed to fetch GAD response:", error);
            }
        };

        fetchGadResponse();
    }, []);

    const handleSelectOption = (questionKey, val) => {
        setFormValues(prev => ({ ...prev, [questionKey]: val }));
    };

    const handleSelectDifficulty = (val) => {
        setFormValues(prev => ({ ...prev, difficulty: val }));
    };

    const getAnxietyMessage = (score) => {
        if (score <= 4) return "Minimal anxiety";
        if (score <= 9) return "Mild anxiety";
        if (score <= 14) return "Moderate anxiety";
        return "Severe anxiety";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Assert all questions and difficulty are selected
        const unanswered = Object.keys(formValues).filter(k => 
            k.startsWith('question_') && formValues[k] === undefined
        );
        if (unanswered.length > 0 || !formValues.difficulty) {
            toast.error("Please answer all questions before submitting.");
            return;
        }

        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const apiUrl = process.env.REACT_APP_BACKEND_URL;

        try {
            const endpoint = showForm
                ? `${apiUrl}/api/updategadform/${userId}/`
                : `${apiUrl}/api/gadform/`;
    
            const method = showForm ? 'put' : 'post';
    
            const response = await axios({
                method: method,
                url: endpoint,
                data: formValues,
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            const { total_score } = response.data;
            setTotalScore(total_score);
            setAnxietyMessage(getAnxietyMessage(total_score));
    
            localStorage.setItem("is_filled", 1);
            localStorage.setItem("score", total_score);
            setFlagValue(true);
            setShowForm(false);
            toast.success("Assessment submitted successfully!");
        } catch (error) {
            console.error('Failed to submit the form', error);
            toast.error("Submission failed. Check your network.");
        }
    };

    const handleRefill = () => {
        setShowForm(true);
    };

    const getScoreColor = (score) => {
        if (score <= 4) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
        if (score <= 9) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
        if (score <= 14) return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    };

    return (
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card max-w-2xl mx-auto text-slate-100">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block text-center mb-1">Psychometric Survey</span>
            <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">
                GAD-7 Anxiety Assessment
            </h2>

            {flagValue && !showForm ? (
                <div className="text-center py-6 space-y-6">
                    <div className="w-28 h-28 rounded-full border-4 border-dashed border-indigo-500/40 flex flex-col items-center justify-center mx-auto animate-pulse-slow bg-slate-950/40">
                        <span className="text-3xl font-black text-white">{totalScore}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500">Score</span>
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                        <h3 className="text-xl font-bold text-white">Record Verified</h3>
                        <p className="text-slate-400 text-sm font-light">Your current baseline indicates:</p>
                        <div className={`py-3 px-6 rounded-2xl border text-base font-bold ${getScoreColor(totalScore)}`}>
                            {anxietyMessage}
                        </div>
                    </div>

                    <div className="pt-6 space-y-3">
                        <button 
                            onClick={handleRefill} 
                            className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition duration-200 shadow-md shadow-indigo-600/10"
                        >
                            Retake Assessment
                        </button>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                            If your state of mind has changed or you are starting a new tracking cycle, update your GAD score.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="py-2.5 px-4 rounded-xl text-center text-xs font-semibold tracking-wide border bg-indigo-500/5 border-indigo-500/20 text-indigo-300">
                        {showForm ? "You are updating your GAD-7 assessment." : "This baseline GAD-7 form is required before eye-tracking calibration."}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <p className="text-sm text-slate-300 leading-relaxed font-light">
                            Over the last **two weeks**, how often have you been bothered by the following problems?
                        </p>

                        {[
                            "Feeling nervous, anxious, or on edge?",
                            "Not being able to stop or control worrying?",
                            "Worrying too much about different things?",
                            "Trouble relaxing?",
                            "Being so restless that it is hard to sit still?",
                            "Becoming easily annoyed or irritable?",
                            "Feeling afraid, as if something awful might happen?"
                        ].map((question, index) => {
                            const questionKey = `question_${index + 1}`;
                            return (
                                <div key={index} className="space-y-3 p-5 rounded-2xl bg-slate-950/20 border border-slate-800/40">
                                    <h4 className="text-sm font-semibold text-slate-200">{index + 1}. {question}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                        {["Not at all", "Several days", "More than half", "Nearly every day"].map((option, idx) => {
                                            const isSelected = formValues[questionKey] === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSelectOption(questionKey, idx)}
                                                    className={`py-2 px-3 text-xs rounded-xl border font-light transition duration-200 ${
                                                        isSelected
                                                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                                                            : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                                    }`}
                                                >
                                                    {option}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="space-y-3 p-5 rounded-2xl bg-slate-950/20 border border-slate-800/40">
                            <h4 className="text-sm font-semibold text-slate-200">
                                8. If you checked any problems, how difficult have they made it for you to do work, home tasks, or get along with people?
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                {["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"].map((option, idx) => {
                                    const isSelected = formValues.difficulty === option;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectDifficulty(option)}
                                            className={`py-2.5 px-3 text-xs rounded-xl border font-light transition duration-200 ${
                                                isSelected
                                                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                                                    : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition duration-200 shadow-md shadow-indigo-600/10"
                        >
                            {showForm ? "Update Record" : "Submit Assessment"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GadForm;
