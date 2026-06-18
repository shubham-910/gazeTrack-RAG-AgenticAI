import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavbarMenu from "../components/NavbarMenu";
import GazeVisualizer from "../components/GazeVisualizer";
import Footer from "./Footer";

const LandingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state && location.state.message) {
            toast.success(location.state.message);
        }
    }, [location]);

    return (
        <div className="bg-theme-background min-h-screen text-slate-100 flex flex-col">
            <NavbarMenu />
            
            {/* Hero Section */}
            <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center pt-32 pb-20 px-8 flex-grow">
                <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-12 lg:mb-0">
                    <div className="relative group w-full h-[380px]">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-full h-full">
                            <GazeVisualizer />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Structured CBT AI Agent & HIPAA Safeguards Active
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                        Identify and Manage Visual Anxiety Triggers
                    </h1>
                    <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
                        Our platform uses advanced attention bias tracking to help you understand your anxiety triggers and stress patterns. 
                        By analyzing your visual focus and providing personalized feedback, we guide you in training your attention, reducing anxiety, and improving your overall mental well-being.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <button
                            onClick={() => navigate("/category")}
                            className="py-3.5 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30"
                        >
                            Get Started
                        </button>
                        <a 
                            href="#more-content" 
                            className="py-3 px-8 text-slate-400 hover:text-white transition duration-200 font-semibold flex items-center gap-2"
                        >
                            Explore Strategies
                            <svg className="w-4 h-4 animate-bounce mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Read More Section */}
            <div id="more-content" className="py-24 px-8 border-t border-slate-800 bg-slate-950/40">
                <div className="container mx-auto">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
                            Attentional Bias Modification (ABM) Strategies
                        </h2>
                        <p className="text-slate-400 font-light">
                            Our application utilizes scientifically validated cognitive strategies to retrain attention pathways and modify automated threat-monitoring biases.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Strategy 1 - Framing */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-6 text-xl">01</div>
                            <h3 className="text-xl font-bold text-white mb-4">Framing</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Shift focus to your progress and achievements rather than setbacks. By seeing your attention bias journey in a constructive light, you build immediate confidence and motivation.
                            </p>
                        </div>

                        {/* Strategy 2 - Customization */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-6 text-xl">02</div>
                            <h3 className="text-xl font-bold text-white mb-4">Customization</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Tailoring attention bias targets to your immediate anxiety parameters makes each practice session significantly more effective and personalized to your triggers.
                            </p>
                        </div>

                        {/* Strategy 3 - Feedback Loops */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-6 text-xl">03</div>
                            <h3 className="text-xl font-bold text-white mb-4">Feedback Loops</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Real-time monitoring shows how your gaze behaves. Visualizing small positive changes builds deep awareness and reinforces progress toward cognitive regulation.
                            </p>
                        </div>

                        {/* Strategy 4 - Goal Setting */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-6 text-xl">04</div>
                            <h3 className="text-xl font-bold text-white mb-4">Goal Setting</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Small, manageable targets trigger immediate sense of accomplishment. Step-by-step progressions cultivate cognitive resilience without inducing stress.
                            </p>
                        </div>

                        {/* Strategy 5 - Positive Reinforcement */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-6 text-xl">05</div>
                            <h3 className="text-xl font-bold text-white mb-4">Positive Reinforcement</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Tracking progress rewards visual shifting milestones, raising baseline mood and strengthening habit patterns that anchor attention away from anxious stimuli.
                            </p>
                        </div>

                        {/* Strategy 6 - Emotional Awareness */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold mb-6 text-xl">06</div>
                            <h3 className="text-xl font-bold text-white mb-4">Emotional Awareness</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Mapping your visual attention highlights subconscious patterns before they trigger physiological symptoms, giving you tools to return to grounding techniques.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default LandingPage;
