import React from "react";
import { useLocation } from "react-router-dom";
import LoginComp from "./LoginComp";
import RegisterComp from "./RegisterComp";
import GazeVisualizer from "./GazeVisualizer";

const HomePage = () => {
  const location = useLocation();

  const renderForm = () => {
    if (location.pathname === "/register") {
      return <RegisterComp />;
    }
    return <LoginComp />;
  };

  return (
    <div className="min-h-screen w-full bg-theme-background flex flex-col lg:flex-row items-center justify-center px-6 py-12 relative overflow-hidden select-none">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      {/* Left Section: Dynamic Graphic & Visual Slogan */}
      <div className="flex flex-col justify-center items-center lg:items-start w-full lg:w-1/2 p-6 lg:p-12 z-10 max-w-lg lg:max-w-xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8 text-center lg:text-left leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
          Empower your focus,<br />Transform your mind
        </h1>
        <div className="w-full h-[320px] relative group mt-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative w-full h-full">
            <GazeVisualizer />
          </div>
        </div>
      </div>

      {/* Right Section: Glassmorphic Auth Form Card */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 z-10">
        <div className="w-full max-w-md">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
