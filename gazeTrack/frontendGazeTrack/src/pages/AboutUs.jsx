import React from "react";
import NavbarMenu from "../components/NavbarMenu";
import Footer from "./Footer";

const AboutUs = () => {
  return (
    <div className="bg-theme-background min-h-screen text-slate-100 flex flex-col justify-between select-none relative">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <NavbarMenu />

      {/* Main Content Section */}
      <div className="container mx-auto px-6 pt-28 pb-16 z-10 max-w-5xl flex-grow">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Our Philosophy</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            About Our Application
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            This platform was created to help individuals manage and reduce anxiety and stress through modern technological solutions. 
            By leveraging advanced real-time gaze tracking and personalized cognitive feedback, we provide data-driven tools that strengthen attentional resilience.
          </p>
        </div>

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Card 1: What We Do */}
          <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              What We Do
            </h2>
            <ul className="space-y-4 text-sm text-slate-400 font-light">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Offer an innovative platform integrating <strong className="text-slate-200 font-semibold">gaze tracking</strong> and <strong className="text-slate-200 font-semibold">machine learning</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Help users gain insights into their subconscious <strong className="text-slate-200 font-semibold">attention bias patterns</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Provide personalized, clinical-grade feedback and targeted CBT interventions.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Why Our Platform */}
          <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Why Our Platform
            </h2>
            <ul className="space-y-4 text-sm text-slate-400 font-light">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Bridges the gap in attention bias support with highly accessible, zero-cost tools.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Designed for anyone seeking visual guidance through anxiety, stress, or trigger regulation.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Provides real-time metric evaluation at any stage of your mindfulness journey.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: How to Use */}
          <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              How to Use
            </h2>
            <ul className="space-y-4 text-sm text-slate-400 font-light">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Register for an account and complete the baseline GAD-7 anxiety survey.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Select a picture category and calibrate your webcam by clicking the 9 red dot targets.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>Observe the stimulus images and retrieve your customized CBT Gaze Agent clinical report.</span>
              </li>
            </ul>
          </div>

          {/* Card 4: How We Work */}
          <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              How We Work
            </h2>
            <ul className="space-y-4 text-sm text-slate-400 font-light">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Combine <strong className="text-slate-200 font-semibold">technology</strong> and <strong className="text-slate-200 font-semibold">psychology</strong> for effective, scientifically-grounded solutions.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Utilize strict, pseudonymized user data partitions to respect HIPAA regulations.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>Refine machine learning vectors continuously based on spatial calibration feedback.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance and AI Architecture Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Agentic AI Architecture Card */}
          <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card hover:border-emerald-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Agentic AI Clinical Loop
            </h2>
            <div className="space-y-4 text-sm text-slate-400 font-light">
              <p>
                Our backend orchestrates a structured clinical loop powered by Google Gemini models. The process is fully automated and follows key parameters:
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Data Intake:</strong> Collects viewport-aware spatial coordinates and computed gaze counts over positive vs. negative stimulus.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Response Schema:</strong> Enforces a strict JSON validation structure containing clinical assessments, attention ratios, CBT exercises, and next steps.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Attentional Retraining:</strong> Formulates actionable Attentional Bias Modification (ABM) techniques tailored to individual anxiety levels.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* HIPAA & PHI Safety Card */}
          <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-glass-card hover:border-indigo-500/50 hover:shadow-glass-card-glow transition duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              Concrete HIPAA & PHI Controls
            </h2>
            <div className="space-y-4 text-sm text-slate-400 font-light">
              <p>
                We execute privacy controls programmatically rather than making vague promises. Your Protected Health Information (PHI) is secured via three layers:
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">1.</span>
                  <span><strong>Zero Video Capture:</strong> Camera processing runs strictly client-side. Raw image coordinates are evaluated in your browser sandbox and immediately discarded; no video is sent to our servers.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">2.</span>
                  <span><strong>Safe Harbor De-Identification:</strong> Prompt parameters sent to the Gemini API are completely stripped of usernames, emails, or names, replacing them with randomized pseudonymous references.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">3.</span>
                  <span><strong>Encryption Standards:</strong> All database tables reside behind secure pools using TLS 1.3 for data in-transit and AES-256 database-level encryption at-rest.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Dynamic Tools Section */}
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-glass-card hover:border-indigo-500/50 transition duration-300">
          <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">Our Core Toolsets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-400 font-light">
            <div className="space-y-2 p-4 bg-slate-950/25 rounded-2xl border border-slate-800/40">
              <h3 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Gaze Tracking Engine
              </h3>
              <p className="text-xs">Monitors coordinate distributions on screen, identifying attentional focus thresholds between negative and positive stimulus categories.</p>
            </div>
            <div className="space-y-2 p-4 bg-slate-950/25 rounded-2xl border border-slate-800/40">
              <h3 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Structured AI CBT Agent
              </h3>
              <p className="text-xs">Invokes specialized LLM routines in the backend to provide customized persuasive feedback plans and stress-reducing exercises.</p>
            </div>
            <div className="space-y-2 p-4 bg-slate-950/25 rounded-2xl border border-slate-800/40">
              <h3 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Real-Time Visualizations
              </h3>
              <p className="text-xs">Maps spatial indices dynamically onto responsive dashboard graphics to visualize progress benchmarks over time.</p>
            </div>
            <div className="space-y-2 p-4 bg-slate-950/25 rounded-2xl border border-slate-800/40">
              <h3 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Persuasive Grounding
              </h3>
              <p className="text-xs">Leverages cognitive tailoring, positive reinforcement, and feedback loops to strengthen habit patterns away from visual triggers.</p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
