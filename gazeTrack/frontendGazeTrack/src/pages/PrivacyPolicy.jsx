import React from 'react';
import Footer from './Footer';
import NavbarMenu from '../components/NavbarMenu';

const PrivacyPolicy = () => {
    return (
        <div className="bg-theme-background min-h-screen flex flex-col relative select-none">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <NavbarMenu />

            {/* Main Content */}
            <div className="flex-grow z-10 px-6 py-20">
                <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-glass-card my-12">

                    <div className="text-center space-y-1 mb-12">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Legal & Security</span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-xs text-slate-400 font-light">Last updated: June 2026</p>
                    </div>

                    <div className="space-y-10">
                        {/* Introduction */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                1. Introduction
                            </h2>
                            <ul className="list-disc list-inside text-sm text-slate-400 font-light leading-relaxed pl-2 space-y-1.5">
                                <li>We prioritize your clinical privacy and are committed to protecting your sensitive data.</li>
                                <li>This policy outlines the type of data we collect, processing bounds, and security parameters.</li>
                            </ul>
                        </section>

                        {/* Information We Collect */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                2. Information We Collect & De-Identification Controls
                            </h2>
                            <ul className="list-disc list-inside text-sm text-slate-400 font-light leading-relaxed pl-2 space-y-1.5">
                                <li>We collect spatial gaze tracking data, including resolution-aware X-coordinate maps, test dates, and GAD-7 anxiety survey values.</li>
                                <li><strong className="text-slate-300 font-medium">Zero Video Footprint:</strong> No video feeds, raw image frames, or facial expression models are ever stored or uploaded. Camera frame interpretation processes run exclusively client-side in your local browser sandbox (using local MediaPipe landmarks) and are discarded instantly.</li>
                                <li><strong className="text-slate-300 font-medium">Safe Harbor De-Identification:</strong> To comply with HIPAA regulations, any data shared with external analytical models (like the Google Gemini CBT Gaze Agent) is fully stripped of Personally Identifiable Information (PII) including name, username, and email. Data is transmitted strictly using randomized pseudonymous IDs.</li>
                            </ul>
                        </section>

                        {/* How We Use the Data */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                3. How We Use the Data
                            </h2>
                            <ul className="list-disc list-inside text-sm text-slate-400 font-light leading-relaxed pl-2 space-y-1.5">
                                <li>To calculate spatial attentional bias indices and guide your cognitive feedback sessions.</li>
                                <li>To provide inputs to backend CBT Gaze Agents to generate mental well-being reports.</li>
                                <li>Data is used solely to facilitate the core functional pipeline.</li>
                            </ul>
                        </section>

                        {/* Data Sharing */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                4. Data Sharing
                            </h2>
                            <ul className="list-disc list-inside text-sm text-slate-400 font-light leading-relaxed pl-2 space-y-1.5">
                                <li>Your clinical records and coordinates are never sold or shared with commercial entities.</li>
                                <li>Any regulatory audit processes are handled using strictly pseudonymized datasets.</li>
                            </ul>
                        </section>

                        {/* Data Storage and Security */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                5. Data Storage & HIPAA Safeguards
                            </h2>
                            <ul className="list-disc list-inside text-sm text-slate-400 font-light leading-relaxed pl-2 space-y-1.5">
                                <li>All database tables are secured behind VPC network boundaries using AES-256 encryption-at-rest and HTTPS/TLS 1.3 in-transit.</li>
                                <li>Personal identifiers (emails, names, usernames) are stored in decoupled, isolated tables partitioned from clinical coordinates and LLM assessment records using pseudonymous database UUID associations.</li>
                            </ul>
                        </section>

                        {/* User Rights */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                6. Your Rights
                            </h2>
                            <ul className="list-disc list-inside text-sm text-slate-400 font-light leading-relaxed pl-2 space-y-1.5">
                                <li>You retain the right to query, edit, or completely purge your profile parameters and historical test records.</li>
                            </ul>
                        </section>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
