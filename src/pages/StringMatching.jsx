import { useState, useEffect } from 'react';
import { kmpSearch } from '../utils/kmp';

export default function StringMatching() {
  const [text, setText] = useState("AABAACAADAABAABA");
  const [pattern, setPattern] = useState("AABA");
  
  const [history, setHistory] = useState([]);
  const [lps, setLps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  const runVisualizer = () => {
    if (!text || !pattern) return alert("Please enter both text and a pattern.");
    const result = kmpSearch(text.toUpperCase(), pattern.toUpperCase());
    setHistory(result.history);
    setLps(result.lps);
    setCurrentStep(0);
    setIsRunning(true);
  };

  useEffect(() => {
    if (isRunning && currentStep < history.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 600); // 600ms per step to clearly see the matching
      return () => clearTimeout(timer);
    } else if (currentStep === history.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, history]);

  const resetVis = () => {
    setHistory([]);
    setLps([]);
    setCurrentStep(-1);
    setIsRunning(false);
  };

  const currentSnapshot = currentStep >= 0 ? history[currentStep] : null;
  const currentShift = currentSnapshot ? currentSnapshot.shift : 0;

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">String Searching (KMP)</h1>
          <p className="text-slate-400 mt-1">Visualize the Knuth-Morris-Pratt $O(N+M)$ pattern matching algorithm.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={runVisualizer} disabled={isRunning} className="flex-1 md:flex-none px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400 transition font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50">
            Start Search
          </button>
          <button onClick={resetVis} disabled={isRunning} className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium border border-slate-700 disabled:opacity-50">
            Clear
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Inputs & LPS Table */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit flex flex-col gap-6">
          <div>
            <label className="text-sm font-bold text-emerald-400">Target Text</label>
            <input 
              type="text" value={text} onChange={e => setText(e.target.value)} disabled={isRunning}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-cyan-400">Search Pattern</label>
            <input 
              type="text" value={pattern} onChange={e => setPattern(e.target.value)} disabled={isRunning}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono uppercase focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* LPS Array Visualization */}
          {lps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 mb-2">LPS (Prefix) Array Built:</h3>
              <div className="flex flex-wrap gap-1">
                {lps.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400">{pattern[idx]}</div>
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-950 border border-slate-700 text-sm font-bold">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: The Sliding Window Canvas */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-lg border border-slate-800 overflow-x-auto min-h-[300px] flex flex-col justify-center">
          
          <div className="flex flex-col gap-4 relative min-w-max pb-12">
            
            {/* The Main Text (Static) */}
            <div className="flex gap-1 relative z-10">
              {text.toUpperCase().split('').map((char, idx) => {
                let statusClass = "bg-slate-800 border-slate-700 text-slate-300";
                
                // Styling based on current comparison
                if (currentSnapshot) {
                   if (idx === currentSnapshot.tIdx) {
                     if (currentSnapshot.action === 'compare') statusClass = "bg-amber-500/20 border-amber-500 text-amber-400 scale-110 shadow-lg z-20";
                     if (currentSnapshot.action === 'match' || currentSnapshot.action === 'found') statusClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-110 shadow-lg z-20";
                     if (currentSnapshot.action === 'mismatch') statusClass = "bg-rose-500/20 border-rose-500 text-rose-400 scale-110 shadow-lg z-20";
                   } else if (idx >= currentSnapshot.shift && idx < currentSnapshot.tIdx) {
                     statusClass = "bg-emerald-900/40 border-emerald-800 text-emerald-500"; // Previously matched in this window
                   }
                }

                return (
                  <div key={`t-${idx}`} className={`w-12 h-14 flex items-center justify-center rounded border-2 text-2xl font-mono font-bold transition-all duration-300 ${statusClass}`}>
                    {char}
                  </div>
                );
              })}
            </div>

            {/* The Pattern (Sliding Window) */}
            <div 
              className="flex gap-1 absolute top-[72px] transition-all duration-500 ease-in-out"
              style={{ transform: `translateX(${currentShift * 52}px)` }} /* 48px width + 4px gap = 52px */
            >
              {pattern.toUpperCase().split('').map((char, idx) => {
                let statusClass = "bg-slate-950 border-slate-700 text-slate-500";
                
                if (currentSnapshot) {
                  if (idx === currentSnapshot.pIdx) {
                     if (currentSnapshot.action === 'compare') statusClass = "bg-amber-900 border-amber-500 text-amber-400 shadow-lg";
                     if (currentSnapshot.action === 'match' || currentSnapshot.action === 'found') statusClass = "bg-emerald-900 border-emerald-500 text-emerald-400 shadow-lg";
                     if (currentSnapshot.action === 'mismatch') statusClass = "bg-rose-900 border-rose-500 text-rose-400 shadow-lg";
                  } else if (idx < currentSnapshot.pIdx) {
                     statusClass = "bg-emerald-950 border-emerald-800 text-emerald-600"; // Previously matched
                  }
                }

                return (
                  <div key={`p-${idx}`} className={`w-12 h-14 flex items-center justify-center rounded border-2 border-dashed text-xl font-mono transition-all duration-300 ${statusClass}`}>
                    {char}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Feedback Text */}
          <div className="h-8 mt-8 text-center text-lg font-bold">
            {currentSnapshot?.action === 'compare' && <span className="text-amber-400">Comparing characters...</span>}
            {currentSnapshot?.action === 'match' && <span className="text-emerald-400">Match! Moving to next character.</span>}
            {currentSnapshot?.action === 'mismatch' && <span className="text-rose-400">Mismatch! Consulting LPS table to shift...</span>}
            {currentSnapshot?.action === 'found' && <span className="text-indigo-400 animate-pulse">Pattern successfully found!</span>}
          </div>

        </div>
      </div>
    </div>
  );
}