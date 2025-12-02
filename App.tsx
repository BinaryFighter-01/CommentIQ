
import React, { useState, useEffect } from 'react';
import { Loader2, BarChart3, Youtube, Zap, AlertTriangle, Sun, Moon } from 'lucide-react';
import { AppState } from './types';
import { fetchComments } from './services/platformService';
import { analyzeComments } from './services/geminiService';
import Dashboard from './components/Dashboard';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [state, setState] = useState<AppState>({
    isLoading: false,
    progress: { stage: '', current: 0 },
    error: null,
    comments: [],
    analysis: null,
    url: ''
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const executeAnalysis = async (targetUrl: string) => {
    if (!targetUrl) return;

    setState(prev => ({ 
      ...prev, 
      url: targetUrl, 
      isLoading: true, 
      error: null, 
      analysis: null,
      progress: { stage: 'Initializing Connection...', current: 0 }
    }));

    try {
      // 1. Fetch Comments
      const comments = await fetchComments(targetUrl, (count, stage) => {
          setState(prev => ({ ...prev, progress: { stage, current: count } }));
      });
      
      if (comments.length === 0) throw new Error("No accessible comments found.");

      // 2. Analyze
      setState(prev => ({ 
        ...prev, 
        comments, 
        progress: { stage: `Running Deep-Learning Models on ${comments.length} items...`, current: comments.length } 
      }));
      
      const analysis = await analyzeComments(comments);

      setState(prev => ({
        ...prev,
        isLoading: false,
        comments,
        analysis
      }));

    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message || "An unexpected error occurred." }));
    }
  };

  const resetAnalysis = () => {
    setState(prev => ({ ...prev, analysis: null, comments: [], url: '' }));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-brand-500/30 overflow-x-hidden transition-colors duration-300`}>
      
      {/* Navbar */}
      <nav className="border-b border-theme-border bg-theme-glass backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className={`bg-gradient-to-tr from-red-600 to-red-400 p-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform`}>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-xl font-bold tracking-tight text-theme-text leading-none">CommentIQ</h1>
               <span className={`text-[10px] uppercase font-bold tracking-widest text-red-500`}>Enterprise AI</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-theme-glass text-theme-muted hover:text-theme-text transition-colors border border-transparent hover:border-theme-border"
                aria-label="Toggle Theme"
             >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-[1600px] mx-auto px-6 py-12 w-full">
        
        {/* Landing View */}
        {!state.analysis && !state.isLoading && (
          <div className="max-w-4xl mx-auto text-center mt-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-glass border border-theme-border text-sm text-theme-muted mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
               <Zap size={14} className="text-brand-500"/>
               <span>Proprietary Deep-Learning Engine</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-b from-theme-text via-theme-muted to-gray-500 bg-clip-text text-transparent tracking-tight leading-tight pb-2">
               Unlock Community <br/> Intelligence.
            </h1>
            
            <div className="relative group max-w-2xl mx-auto mb-16 z-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 animate-pulse-slow"></div>
              <div className="relative flex items-center bg-theme-bg border border-theme-border rounded-2xl p-2 shadow-2xl">
                <input 
                  type="text" 
                  placeholder="Paste YouTube Video URL..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-theme-text px-6 py-4 placeholder-theme-muted text-lg font-medium"
                  value={state.url}
                  onChange={(e) => setState(prev => ({ ...prev, url: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && executeAnalysis(state.url)}
                />
                <button 
                  onClick={() => executeAnalysis(state.url)}
                  className="bg-red-600 text-white hover:bg-red-500 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                >
                  Analyze
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
               <button onClick={() => executeAnalysis('https://youtu.be/RMAux-sD1bA?si=N_CAbDD6QyThkIRr')} className="flex items-center justify-center gap-3 p-4 rounded-xl bg-theme-glass border border-theme-border hover:bg-theme-glass/80 hover:border-red-500/50 transition-all group min-w-[200px]">
                  <Zap className="text-yellow-500 group-hover:scale-110 transition-transform"/>
                  <span className="text-theme-muted group-hover:text-theme-text font-medium transition-colors">Tesla Cybertruck (MKBHD)</span>
               </button>
               <button onClick={() => executeAnalysis('https://www.youtube.com/watch?v=k238XpMMn38')} className="flex items-center justify-center gap-3 p-4 rounded-xl bg-theme-glass border border-theme-border hover:bg-theme-glass/80 hover:border-blue-500/50 transition-all group min-w-[200px]">
                  <Youtube className="text-blue-500 group-hover:scale-110 transition-transform"/>
                  <span className="text-theme-muted group-hover:text-theme-text font-medium transition-colors">Me at the zoo (Classic)</span>
               </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-8">
              <div className="w-32 h-32 border-4 border-theme-border rounded-full"></div>
              <div className={`absolute top-0 w-32 h-32 border-4 border-red-500 border-t-transparent rounded-full animate-spin`}></div>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-theme-text">
                 {Math.min(100, Math.floor((state.progress.current / 600) * 100))}%
              </div>
            </div>
            <h2 className="text-3xl font-bold text-theme-text mb-2 animate-pulse">Processing Data Stream</h2>
            <p className="text-theme-muted font-mono mb-1">{state.progress.stage}</p>
            <p className="text-gray-500 text-sm">Items Loaded: {state.progress.current.toLocaleString()}</p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
           <div className="max-w-xl mx-auto mt-20 p-6 bg-red-500/10 border border-red-500/50 rounded-2xl text-center backdrop-blur-xl animate-in slide-in-from-bottom-2">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-theme-text mb-2">Analysis Interrupted</h3>
              <p className="text-red-400 mb-6">{state.error}</p>
              <button onClick={() => setState(prev => ({ ...prev, error: null, isLoading: false }))} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors">Try Again</button>
           </div>
        )}

        {/* Dashboard */}
        {state.analysis && (
          <Dashboard analysis={state.analysis} comments={state.comments} onReset={resetAnalysis} />
        )}

      </main>
    </div>
  );
}

export default App;
