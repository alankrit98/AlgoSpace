import { useState, useEffect } from 'react';
import { calculatePageReplacement } from '../utils/pageReplacement';

export default function MemoryManagement() {
  const [referenceString, setReferenceString] = useState("7,0,1,2,0,3,0,4,2,3,0,3,2");
  const [capacity, setCapacity] = useState(3);
  const [algorithm, setAlgorithm] = useState("lru");
  
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  const pages = referenceString.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

  const runSimulation = () => {
    if (pages.length === 0) return alert("Please enter a valid reference string.");
    const result = calculatePageReplacement(pages, capacity, algorithm);
    setHistory(result.history);
    setCurrentStep(-1);
    setIsRunning(true);
  };

  useEffect(() => {
    if (isRunning && currentStep < history.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800); // 800ms per step for smooth visual tracking
      return () => clearTimeout(timer);
    } else if (currentStep === history.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, history]);

  const resetSimulation = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsRunning(false);
  };

  const currentSnapshot = currentStep >= 0 ? history[currentStep] : null;

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Memory Management (OS)</h1>
          <p className="text-slate-400 mt-1">Visualize LRU and FIFO Page Replacement.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-bold text-slate-400">RAM Frames:</label>
          <input 
            type="number" min="2" max="6" value={capacity} 
            onChange={e => setCapacity(parseInt(e.target.value) || 3)}
            disabled={isRunning}
            className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <select 
            value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} disabled={isRunning}
            className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          >
            <option value="lru">Least Recently Used (LRU)</option>
            <option value="fifo">First-In, First-Out (FIFO)</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Panel */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
          <h2 className="text-lg font-bold mb-4 text-emerald-400">Reference String</h2>
          <p className="text-xs text-slate-400 mb-2">Comma-separated memory page requests:</p>
          <textarea 
            value={referenceString}
            onChange={e => setReferenceString(e.target.value)}
            disabled={isRunning}
            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white font-mono mb-4 h-24 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <div className="flex gap-2">
            <button onClick={runSimulation} disabled={isRunning} className="flex-1 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-400 transition font-bold disabled:opacity-50">
              Start
            </button>
            <button onClick={resetSimulation} disabled={isRunning} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition font-bold disabled:opacity-50">
              Reset
            </button>
          </div>
        </div>

        {/* Visualizer Panel */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-lg border border-slate-800 flex flex-col justify-between">
          
          {/* Incoming Pages Ticker */}
          <div className="mb-8 overflow-hidden relative">
            <h3 className="text-sm font-bold text-slate-400 mb-3">Incoming Page Requests:</h3>
            <div className="flex gap-2">
              {pages.map((p, idx) => {
                let statusClass = "bg-slate-800 text-slate-400 border-slate-700"; // Waiting
                if (idx === currentStep) statusClass = "bg-indigo-500 text-white border-indigo-400 scale-110 shadow-lg shadow-indigo-500/50 z-10"; // Active
                else if (idx < currentStep) {
                  // Past actions
                  const act = history[idx]?.action;
                  statusClass = act === "HIT" ? "bg-emerald-900/50 text-emerald-500 border-emerald-800" : "bg-rose-900/50 text-rose-500 border-rose-800";
                }
                
                return (
                  <div key={idx} className={`w-10 h-10 flex items-center justify-center rounded border transition-all duration-300 ${statusClass} font-mono font-bold`}>
                    {p}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical RAM Frames */}
          <div className="flex flex-col items-center justify-center flex-1">
            <h3 className="text-sm font-bold text-slate-400 mb-6">Physical RAM (Frames)</h3>
            <div className="flex gap-4 p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
              
              {/* If simulation hasn't started, show empty slots */}
              {currentSnapshot === null ? (
                 Array(capacity).fill(null).map((_, i) => (
                  <div key={i} className="w-16 h-24 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 font-mono text-2xl bg-slate-900/50">
                    -
                  </div>
                ))
              ) : (
                /* Show actual simulation data */
                currentSnapshot.framesSnapshot.map((pageInFrame, i) => {
                  const isNewArrival = pageInFrame !== null && pageInFrame === currentSnapshot.pageRequested && currentSnapshot.action === "FAULT";
                  const isHit = pageInFrame !== null && pageInFrame === currentSnapshot.pageRequested && currentSnapshot.action === "HIT";
                  
                  let frameStyle = "border-slate-600 bg-slate-800 text-slate-200";
                  if (isNewArrival) frameStyle = "border-rose-500 bg-rose-900/30 text-rose-400 scale-105 shadow-lg shadow-rose-500/20";
                  if (isHit) frameStyle = "border-emerald-500 bg-emerald-900/30 text-emerald-400 scale-105 shadow-lg shadow-emerald-500/20";

                  return (
                    <div key={i} className={`w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center font-mono text-3xl transition-all duration-300 ${frameStyle}`}>
                      {pageInFrame !== null ? pageInFrame : "-"}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Status Feedback */}
            <div className="h-12 mt-6 flex items-center justify-center">
              {currentSnapshot && (
                <div className={`text-xl font-bold animate-pulse ${currentSnapshot.action === "HIT" ? "text-emerald-400" : "text-rose-400"}`}>
                  PAGE {currentSnapshot.action}! 
                  {currentSnapshot.replacedPage !== null && <span className="text-slate-400 text-sm ml-2 font-normal">(Evicted Page {currentSnapshot.replacedPage})</span>}
                </div>
              )}
            </div>
          </div>

          {/* Real-time Metrics */}
          {history.length > 0 && currentStep >= 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-around">
               <div className="text-center">
                 <div className="text-3xl font-bold text-rose-400">{history.slice(0, currentStep + 1).filter(h => h.action === "FAULT").length}</div>
                 <div className="text-xs text-slate-400 uppercase tracking-wide">Total Faults</div>
               </div>
               <div className="text-center">
                 <div className="text-3xl font-bold text-emerald-400">{history.slice(0, currentStep + 1).filter(h => h.action === "HIT").length}</div>
                 <div className="text-xs text-slate-400 uppercase tracking-wide">Total Hits</div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}