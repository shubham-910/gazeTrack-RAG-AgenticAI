import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import NavbarMenu from "../components/NavbarMenu";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    prediction = 'unknown',
    testDate = 'N/A',
    leftCount = 0,
    rightCount = 0,
    llm_fetch_response = 'unknown',
  } = location.state || {};

  // eslint-disable-next-line no-unused-vars
  const [gadResponse, setGadResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { width, height } = useWindowSize();

  const anxietyLevel = () => {
    const level = localStorage.getItem('score');
    if (level) {
      const score = parseInt(level, 10);
      if (score <= 4) return "Minimal anxiety";
      if (score <= 9) return "Mild anxiety";
      if (score <= 14) return "Moderate anxiety";
      return "Severe anxiety";
    }
    return "N/A";
  };

  // Modern HTML & Markdown parser to display clinical report beautifully
  const formatResponse = (response) => {
    if (!response || response === 'unknown') return '';

    let clean = response;

    // Strip any residual prompt instruction lines if they somehow appear
    const possiblePrefixes = [
      "Write only the response content in a friendly and approachable tone, without echoing this instruction or examples. Do not change format in the response.",
      "Write only the response content in a friendly and approachable tone, without echoing this instruction or examples."
    ];
    for (const prefix of possiblePrefixes) {
      if (clean.includes(prefix)) {
        clean = clean.slice(clean.indexOf(prefix) + prefix.length).trim();
      }
    }

    // Convert markdown bold (**bold**) to strong HTML tag
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300 font-semibold">$1</strong>');
    
    // Convert bullet points (- bullet) to styled list tags
    clean = clean.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 my-1 font-light">$1</li>');

    // Replace linebreaks with paragraph breaks or standard breaks
    clean = clean.replace(/\n/g, '<br />');

    // Wrap list items
    if (clean.includes('<li')) {
      clean = clean.replace(/(<li.*<\/li>)/gs, '<ul class="my-3 space-y-2">$1</ul>');
    }

    return `<div class="space-y-4 text-slate-300 font-light leading-relaxed">${clean}</div>`;
  };

  const responseLines = formatResponse(llm_fetch_response);

  useEffect(() => {
    const fetchGadData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.error('User ID not found in localStorage.');
          return;
        }

        const apiUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(
          `${apiUrl}/api/getgadform/${userId}/`,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setGadResponse(response.data);
      } catch (error) {
        console.error('Error fetching GAD form data:', error);
        setGadResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGadData();
  }, []);

  const handleHomeclick = () => {
    localStorage.removeItem('selectedCategory');
    navigate('/home');
  };

  const handleRetakeclick = () => {
    navigate('/calibrate');
  };

  const generateFeedback = () => {
    const level = anxietyLevel();
    if (level === "N/A") return <p>Anxiety level information is unavailable.</p>;

    let feedbackTitle = '';
    let feedbackContent = '';

    if (prediction === 'Left') {
      feedbackTitle = 'Your gaze leaned more toward Negative stimuli.';
      switch (level) {
        case 'Severe anxiety':
          feedbackContent = "This indicates a severe vigilance-avoidance cycle. Retraining your attention using clinical exercises can help break this automated threat-monitoring loop.";
          break;
        case 'Moderate anxiety':
          feedbackContent = "Your gaze shows moderate focus on threat targets. Practicing systematic attention-shifting exercises daily is recommended.";
          break;
        case 'Mild anxiety':
          feedbackContent = "A minor negative gaze bias is detected. Routine mindfulness grounding exercises can maintain attention resilience.";
          break;
        case 'Minimal anxiety':
          feedbackContent = "Minimal anxiety baseline detected, but gaze shows transient negative monitoring. Focus on maintaining stress-free routines.";
          break;
        default:
          feedbackContent = 'No specific feedback is available for this anxiety level.';
      }
    } else if (prediction === 'Right') {
      feedbackTitle = 'Your gaze leaned more toward Positive stimuli.';
      switch (level) {
        case 'Severe anxiety':
          feedbackContent = "Excellent attentional target shift, though baseline severe anxiety exists. Keep reinforcement mechanisms high and practice calm breathing.";
          break;
        case 'Moderate anxiety':
          feedbackContent = "Positive attentional flexibility detected. Reinforce your visual pathways with gratitude checks and active journaling.";
          break;
        case 'Mild anxiety':
          feedbackContent = "Good positive gaze alignment. Continue with self-guided cognitive refocusing to keep anxiety indicators low.";
          break;
        case 'Minimal anxiety':
          feedbackContent = "Exceptional target alignment and minimal anxiety scores. Your attention pathways show robust positive flexibility.";
          break;
        default:
          feedbackContent = 'No specific feedback is available for this anxiety level.';
      }
    } else {
      feedbackTitle = 'Gaze pattern data is balanced or processing.';
      feedbackContent = 'Attentional focus is distributed equally between positive and negative stimuli targets.';
    }

    return (
      <div className="space-y-3">
        <h4 className="text-xl font-bold text-indigo-400">{feedbackTitle}</h4>
        <p className="text-slate-300 font-light leading-relaxed">{feedbackContent}</p>
      </div>
    );
  };

  const chartData = {
    labels: ['Negative Stimuli', 'Positive Stimuli'],
    datasets: [
      {
        label: 'Gaze points registered',
        data: [leftCount || 0, rightCount || 0],
        backgroundColor: ['rgba(239, 68, 68, 0.75)', 'rgba(16, 185, 129, 0.75)'],
        borderColor: ['#ef4444', '#10b981'],
        borderWidth: 1.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Attentional Target Dwell Counts',
        color: '#f8fafc',
        font: {
          family: 'Outfit',
          size: 16,
          weight: '600'
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit' }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit' }
        }
      }
    }
  };

  return (
    <div className="bg-theme-background min-h-screen text-slate-100 flex flex-col pt-24 pb-12 px-6">
      <NavbarMenu />
      <Confetti width={width} height={height} numberOfPieces={prediction === 'Right' ? 60 : 15} />

      <div className="container mx-auto max-w-4xl flex-grow flex flex-col justify-center">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-glass-card overflow-hidden">
          
          {/* Tab Header Selector */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setCurrentPage(1)}
              className={`flex-1 py-4 text-center font-semibold transition duration-200 border-b-2 text-sm sm:text-base ${
                currentPage === 1 
                  ? 'border-indigo-500 text-white bg-slate-800/30' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/10'
              }`}
            >
              1. Spatial Attentional Analysis
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`flex-1 py-4 text-center font-semibold transition duration-200 border-b-2 text-sm sm:text-base ${
                currentPage === 2 
                  ? 'border-indigo-500 text-white bg-slate-800/30' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/10'
              }`}
            >
              2. AI CBT Therapy Plan
            </button>
          </div>

          {/* Page content */}
          <div className="p-8 min-h-[400px]">
            {currentPage === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left: Summary Metrics */}
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Assessment Complete</span>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Your Spatial Results
                    </h2>
                  </div>
                  <hr className="border-slate-800" />
                  
                  {loading ? (
                    <p className="text-slate-400 animate-pulse font-light">Retrieving clinical history...</p>
                  ) : (
                    <div className="bg-slate-950/30 border border-slate-800 p-6 rounded-2xl">
                      {generateFeedback()}
                    </div>
                  )}
                  
                  <div className="flex gap-4 text-xs font-light text-slate-400">
                    <p>Date: {new Date(testDate).toLocaleDateString()}</p>
                    <p>•</p>
                    <p>Time: {new Date(testDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Right: Gaze graph */}
                <div className="h-72 w-full bg-slate-950/20 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-center relative">
                  {(leftCount === 0 && rightCount === 0) ? (
                    <div className="text-center space-y-2">
                      <p className="text-slate-500 text-sm font-light">No gaze coordinate data was captured during this session.</p>
                      <p className="text-xs text-slate-600">Ensure your face is well-lit and centered in the webcam during calibration.</p>
                    </div>
                  ) : (
                    <Bar data={chartData} options={chartOptions} />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                <div className="border-l-4 border-indigo-500 pl-4 py-1">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">AI Clinical Guidance</h3>
                  <p className="text-xs text-slate-500">Structured recommendations from Gaze CBT Agent</p>
                </div>
                <div 
                  className="bg-slate-950/20 border border-slate-800/60 p-6 rounded-2xl" 
                  dangerouslySetInnerHTML={{ __html: responseLines }} 
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="px-8 py-5 bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Previous/Next quick triggers */}
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition duration-200 ${
                  currentPage === 1 
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <GrFormPrevious size={18} />
              </button>
              <button
                disabled={currentPage === 2}
                onClick={() => setCurrentPage(2)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition duration-200 ${
                  currentPage === 2 
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MdNavigateNext size={18} />
              </button>
            </div>

            {/* Dashboard Redirects */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleHomeclick}
                className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-white font-semibold py-2.5 px-6 rounded-xl transition duration-200 text-sm"
              >
                Dashboard Home
              </button>
              <button
                onClick={handleRetakeclick}
                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-indigo-600/20 transition duration-200 text-sm"
              >
                Retake Assessment
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultPage;
