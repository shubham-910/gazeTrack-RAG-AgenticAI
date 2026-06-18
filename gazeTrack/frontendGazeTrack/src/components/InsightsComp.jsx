import React, { useState, useEffect } from "react";
import NavbarMenu from "./NavbarMenu";
import Footer from "../pages/Footer";
import GraphComp from "./GraphComp";

const InsightsComp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'agent', text: 'Hi! I am your AI Clinical Assistant. Ask me anything about your past gaze tracking and mental health sessions!', citations: [] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage })
      });

      if (!response.ok) throw new Error("Failed to get chat response");

      const result = await response.json();
      setChatMessages(prev => [...prev, {
        role: 'agent',
        text: result.response,
        citations: result.citations || []
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'agent', text: "I'm sorry, I couldn't connect to my database. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");
        const apiUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await fetch(
          `${apiUrl}/api/getpredict/?userId=${userId}`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteAssessment = async (predictionId) => {
    if (!window.confirm("Are you sure you want to permanently delete this gaze assessment? This action is irreversible according to HIPAA/PHI security guidelines.")) {
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${apiUrl}/api/delete-assessment/${predictionId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setData(prevData => prevData.filter(item => item.prediction_id !== predictionId));
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(predictionId);
          return next;
        });
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to delete assessment.");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("An error occurred while deleting the assessment.");
    }
  };

  const categoryName = (category_number) => {
    const categories = {
      1: "Nature Pictures",
      2: "Male Faces",
      3: "Female Faces",
    };
    return categories[category_number] || "Unknown";
  };

  // Modern HTML & Markdown parser to display clinical report beautifully
  const formatResponse = (response) => {
    if (!response || response === 'unknown') return '<p class="text-slate-500 font-light text-xs">No feedback report generated for this session.</p>';

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
      clean = clean.replace(/(<li.*<\/li>)/gs, '<ul class="my-2 space-y-1.5">$1</ul>');
    }

    return `<div class="space-y-3 text-slate-300 font-light leading-relaxed text-xs sm:text-sm">${clean}</div>`;
  };

  const ChevronIcon = ({ isExpanded }) => (
    <svg
      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="bg-theme-background min-h-screen text-slate-100 flex flex-col justify-between select-none relative">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <NavbarMenu />

      <div className="flex-grow pt-24 pb-12 px-6 flex items-center justify-center z-10">
        {loading ? (
          <div className="w-full max-w-4xl bg-slate-900/40 border border-slate-800/80 backdrop-blur p-12 rounded-3xl shadow-glass-card text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-dashed border-indigo-500/40 animate-spin mx-auto"></div>
            <p className="text-lg text-slate-400 font-light">Retrieving historical cognitive sessions...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="w-full max-w-4xl space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Historical Assessment Metrics
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light">
                Monitor your attentional modifications and clinical advice history logs. Click a session to expand details.
              </p>
            </div>

            {[...data]
              .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
              .map((record) => {
                const isExpanded = expandedIds.has(record.prediction_id);
                return (
                  <div
                    key={record.prediction_id}
                    className={`bg-slate-900/60 border backdrop-blur-md rounded-3xl shadow-glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'border-indigo-500/40' : 'border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    {/* Collapsible Header — always visible */}
                    <button
                      onClick={() => toggleExpanded(record.prediction_id)}
                      className="w-full text-left px-6 sm:px-8 py-5 flex items-center justify-between gap-4 group cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 flex-1 min-w-0">
                        {/* Session icon & date */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                              {new Date(record.test_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-[11px] text-slate-500 font-light">
                              {new Date(record.test_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {categoryName(record.category_number)}
                            </p>
                          </div>
                        </div>

                        {/* Prediction badge */}
                        <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border select-none w-fit ${record.final_prediction === 'Right'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                          {record.final_prediction === 'Right' ? '● Positive Bias' : '● Negative Bias'}
                        </span>
                      </div>

                      {/* Right side: Delete + Chevron */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssessment(record.prediction_id);
                          }}
                          className="py-1.5 px-3 border border-red-500/30 text-red-400/80 hover:text-white rounded-lg hover:bg-red-500/80 hover:border-red-500 transition-all duration-300 text-[10px] font-semibold cursor-pointer hidden sm:inline-block"
                        >
                          Delete
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${isExpanded ? 'bg-indigo-500/15' : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                          }`}>
                          <ChevronIcon isExpanded={isExpanded} />
                        </div>
                      </div>
                    </button>

                    {/* Collapsible Body — animated expand/collapse */}
                    <div
                      className="transition-all duration-500 ease-in-out overflow-hidden"
                      style={{
                        maxHeight: isExpanded ? '1200px' : '0px',
                        opacity: isExpanded ? 1 : 0,
                      }}
                    >
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-slate-800/60">
                        {/* Grid Layout containing chart and texts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
                          <div className="space-y-5">
                            <div className="bg-slate-950/40 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 bg-indigo-500/10 border-l border-b border-indigo-500/20 text-indigo-400 text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
                                Gemini Session report
                              </div>
                              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI CBT Gaze Agent Guidance
                              </h3>
                              <div dangerouslySetInnerHTML={{ __html: formatResponse(record.response_llm) }} />
                            </div>
                          </div>

                          {/* Chart visualizer */}
                          <div className="bg-slate-950/20 border border-slate-800/40 p-4 rounded-2xl flex items-center justify-center h-64 relative shadow-inner">
                            <GraphComp data={record} />
                          </div>
                        </div>

                        {/* Mobile delete button */}
                        <div className="mt-4 sm:hidden flex justify-end">
                          <button
                            onClick={() => handleDeleteAssessment(record.prediction_id)}
                            className="py-1.5 px-4 border border-red-500/30 text-red-400/80 hover:text-white rounded-lg hover:bg-red-500/80 hover:border-red-500 transition-all duration-300 text-[10px] font-semibold"
                          >
                            Delete Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800 backdrop-blur-md p-10 rounded-3xl shadow-glass-card text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 font-bold text-xl">!</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">No Session Data Found</h1>
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              You haven't completed any attentional gaze assessments yet. Start your first session to visualize indicators.
            </p>
            <div className="pt-4">
              <a
                href="/category"
                className="inline-block py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition duration-200"
              >
                Take Gaze Test
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Inline RAG Chat Section */}
      {data.length > 0 && (
        <div className="w-full max-w-4xl mx-auto px-6 mb-16 z-10 relative">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 shadow-glass-card rounded-3xl overflow-hidden flex flex-col">
            {/* Collapsible Header */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border-b border-indigo-500/30 px-6 py-4 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">AI Pattern Analysis</h3>
                  <p className="text-[10px] text-indigo-300 font-light">Chat with your historical gaze and anxiety data</p>
                </div>
              </div>
              <ChevronIcon isExpanded={isChatOpen} />
            </button>

            {/* Collapsible Body */}
            <div
              className="transition-all duration-500 ease-in-out overflow-hidden flex flex-col bg-slate-900/40"
              style={{
                maxHeight: isChatOpen ? '800px' : '0px',
                opacity: isChatOpen ? 1 : 0,
              }}
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[400px] min-h-[250px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] md:max-w-[75%] ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-md'
                      : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-slate-700 shadow-sm'
                      }`}>
                      {msg.text}
                    </div>

                    {/* Citations / Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.citations.map((cite, idx) => (
                          <span key={idx} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/20 transition-colors shadow-sm" onClick={() => toggleExpanded(cite.id)}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Source: {cite.date.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-start">
                    <div className="bg-slate-800/80 px-5 py-4 rounded-2xl rounded-bl-sm border border-slate-700 flex gap-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/50 border-t border-slate-800 flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Find from your old history chat and find pattern..."
                  className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-6 rounded-xl flex items-center justify-center transition-colors font-semibold tracking-wide text-sm shadow-md"
                >
                  Send
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default InsightsComp;
