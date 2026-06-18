import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NavbarMenu = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('No auth token found');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL;
      await axios.post(
        `${apiUrl}/api/logout/`,
        {},
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('is_filled');
      if (localStorage.getItem('selectedCategory')) {
        localStorage.removeItem('selectedCategory');
      }
      navigate('/login');
      toast.success("Logged out successfully...");
    } catch (error) {
      console.error("Logout failed:", error.response ? error.response.data : error.message);
      // Force logout clear on token error
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full py-4 px-8 z-50 transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-slate-900/80 backdrop-blur-md border-slate-700/50 shadow-lg' 
        : 'bg-transparent border-transparent'
    }`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <a href='/home' className="flex items-center gap-2.5 hover:opacity-90 transition duration-300 select-none">
          <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" className="fill-indigo-500/20 stroke-indigo-400" />
            <circle cx="12" cy="12" r="1" className="fill-emerald-400 stroke-emerald-400 animate-pulse" />
          </svg>
          <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
            Gaze<span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Track</span>
          </span>
        </a>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-3xl text-slate-300 hover:text-white transition duration-200"
          >
            ☰
          </button>
        </div>

        {/* Navigation Links for Desktop */}
        <div className="hidden md:flex flex-grow justify-center">
          <ul className="flex space-x-8">
            <li>
              <a href="/home" className="text-slate-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-semibold tracking-wide">
                Home
              </a>
            </li>
            <li>
              <a href="/profile" className="text-slate-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-semibold tracking-wide">
                Profile
              </a>
            </li>
            <li>
              <a href="/insights" className="text-slate-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-semibold tracking-wide">
                Insights
              </a>
            </li>
            <li>
              <a href="/gadpage" className="text-slate-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-semibold tracking-wide">
                GAD7 Form
              </a>
            </li>
            <li>
              <a href="/about-us" className="text-slate-300 hover:text-white hover:scale-105 transition-all duration-200 text-sm font-semibold tracking-wide">
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Logout Button for Desktop */}
        <div className="hidden md:block">
          <button
            onClick={handleLogout}
            className="py-2 px-5 border border-red-500/50 text-red-400 font-semibold rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-sm shadow-red-500/20"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Dropdown Menu for Mobile */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-slate-900/95 border border-slate-700/80 rounded-xl p-6 space-y-4 shadow-2xl backdrop-blur-lg">
          <a href="/home" className="block text-slate-300 hover:text-white font-semibold">Home</a>
          <a href="/profile" className="block text-slate-300 hover:text-white font-semibold">Profile</a>
          <a href="/insights" className="block text-slate-300 hover:text-white font-semibold">Insights</a>
          <a href="/gadpage" className="block text-slate-300 hover:text-white font-semibold">GAD7 Form</a>
          <a href="/about-us" className="block text-slate-300 hover:text-white font-semibold">About Us</a>
          <button onClick={handleLogout} className="block text-left w-full text-red-400 font-semibold hover:text-red-500">Log out</button>
        </div>
      )}
    </nav>
  );
};

export default NavbarMenu;
