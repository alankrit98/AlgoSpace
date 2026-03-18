import { useState, useEffect, useRef } from 'react';
import { bubbleSort, insertionSort, selectionSort, quickSort, mergeSort } from '../utils/algorithms';

// Big O Complexities Dictionary
const complexities = {
  bubble: { time: "O(n²)", space: "O(1)" },
  insertion: { time: "O(n²)", space: "O(1)" },
  selection: { time: "O(n²)", space: "O(1)" },
  quick: { time: "O(n log n)", space: "O(log n)" },
  merge: { time: "O(n log n)", space: "O(n)" }
};

export default function App() {
  const [array, setArray] = useState([]);
  const [comparing, setComparing] = useState([]); 
  const [isSorting, setIsSorting] = useState(false);
  const [delay, setDelay] = useState(400); 
  const [customInput, setCustomInput] = useState("");
  const [historyLog, setHistoryLog] = useState([]);
  const [algorithm, setAlgorithm] = useState("bubble");

  // Analytics State
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  // Debugger Mode State and Refs
  const [isManualMode, setIsManualMode] = useState(false);
  const isManualModeRef = useRef(false);
  const delayRef = useRef(delay);
  const resolveStepRef = useRef(null);
  const logEndRef = useRef(null);

  // Keep refs perfectly synced with React state for the async loops
  useEffect(() => { delayRef.current = delay; }, [delay]);
  useEffect(() => { isManualModeRef.current = isManualMode; }, [isManualMode]);

  // The Magic Execution Controller
  const tick = async (fraction = 1) => {
    if (isManualModeRef.current) {
      // If Debugger is ON, freeze execution until the "Next Step" button resolves this promise
      await new Promise(resolve => { resolveStepRef.current = resolve; });
    } else {
      // If Auto is ON, just wait the standard delay time
      await new Promise(resolve => setTimeout(resolve, delayRef.current * fraction));
    }
  };

  const handleNextStep = () => {
    if (resolveStepRef.current) {
      resolveStepRef.current(); // Unfreeze the promise!
      resolveStepRef.current = null;
    }
  };

  const resetArray = () => {
    if (isSorting) return;
    const newArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 99) + 1);
    setArray(newArray);
    setComparing([]); 
    setCustomInput(""); 
    setHistoryLog(["Generated new random array."]); 
    setComparisons(0);
    setSwaps(0);
  };

  useEffect(() => {
    resetArray();
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [historyLog]);

  const handleCustomInput = () => {
    if (isSorting) return;
    const parsedArray = customInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num)); 
    if (parsedArray.length > 0) {
      setArray(parsedArray);
      setComparing([]);
      setHistoryLog([`Loaded custom array: [${parsedArray.join(', ')}]`]); 
      setComparisons(0);
      setSwaps(0);
    } else {
      alert("Please enter a valid comma-separated list of numbers");
    }
  };

  const runAlgorithm = async () => {
    if (isSorting) return;
    setIsSorting(true);
    setComparisons(0);
    setSwaps(0);
    
    // Pass ALL our hooks and the custom tick function into the algorithm
    const callbacks = {
      setArray, setComparing, setHistoryLog, setComparisons, setSwaps, tick
    };
    
    if (algorithm === "bubble") await bubbleSort(array, callbacks);
    if (algorithm === "insertion") await insertionSort(array, callbacks);
    if (algorithm === "selection") await selectionSort(array, callbacks);
    if (algorithm === "quick") await quickSort(array, callbacks);
    if (algorithm === "merge") await mergeSort(array, callbacks);

    setComparing([]); 
    setIsSorting(false);
  };

  // Allow toggling out of manual mode to instantly resume the rest of the algorithm
  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (isManualMode && resolveStepRef.current) {
      resolveStepRef.current(); 
      resolveStepRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans text-white">
      <h1 className="text-3xl font-bold mb-6">Algorithm Visualizer</h1>
      
      {/* Analytics Dashboard */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-700 w-full max-w-5xl p-4 rounded-lg mb-8 shadow-md text-sm sm:text-base">
        <div className="flex gap-6 text-slate-300">
          <p><span className="text-slate-500 font-bold">Avg Time:</span> <span className="text-emerald-400 font-mono">{complexities[algorithm].time}</span></p>
          <p><span className="text-slate-500 font-bold">Space:</span> <span className="text-emerald-400 font-mono">{complexities[algorithm].space}</span></p>
        </div>
        <div className="flex gap-6 font-bold">
          <p className="text-rose-400">Comparisons: <span className="text-white">{comparisons}</span></p>
          <p className="text-cyan-400">Swaps / Writes: <span className="text-white">{swaps}</span></p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-5xl mb-12 min-h-[100px]">
        {array.map((value, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-xl sm:text-2xl font-bold shadow-lg transition-all duration-300 transform ${
              comparing.includes(idx) 
                ? 'bg-rose-500 scale-110 shadow-rose-500/50 -translate-y-2' 
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            {value}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl">
        {/* Control Panel */}
        <div className="flex flex-col gap-6 flex-1 bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
          <div className="flex flex-col gap-4">
            <button 
              onClick={resetArray} 
              disabled={isSorting}
              className="px-6 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 w-full"
            >
              Random Array
            </button>
            
            <div className="flex gap-2">
              <select 
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isSorting}
                className="bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 flex-1"
              >
                <option value="bubble">Bubble Sort</option>
                <option value="insertion">Insertion Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="quick">Quick Sort</option>
                <option value="merge">Merge Sort</option>
              </select>
              
              <button 
                onClick={runAlgorithm} 
                disabled={isSorting}
                className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-md hover:bg-emerald-400 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                Run Sort
              </button>
            </div>
          </div>

          {/* Debugger & Speed Controls */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isManualMode}
                  onChange={toggleManualMode}
                  className="w-4 h-4 accent-emerald-500"
                />
                Debugger Mode (Step-by-Step)
              </label>
            </div>

            {!isManualMode ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-500">Animation Delay: {delay}ms</label>
                <input 
                  type="range" min="50" max="1500" step="50"
                  value={delay} 
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>
            ) : (
              <button 
                onClick={handleNextStep}
                disabled={!isSorting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏭ Next Step
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
             <label className="text-sm font-medium text-slate-400">Custom Array</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. 5, 2, 9, 1"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                disabled={isSorting}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <button 
                onClick={handleCustomInput}
                disabled={isSorting || customInput.trim() === ""}
                className="px-6 py-2 bg-slate-700 rounded-md hover:bg-slate-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 whitespace-nowrap"
              >
                Set Array
              </button>
            </div>
          </div>
        </div>

        {/* History Log Panel */}
        <div className="flex flex-col flex-1 bg-slate-900 p-0 rounded-lg border border-slate-800 overflow-hidden h-[450px]">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-200">Execution Log</h2>
            <span className={`text-xs px-2 py-1 rounded font-bold ${isManualMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isManualMode ? 'PAUSED' : 'LIVE'}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm text-slate-300 no-scrollbar">
            {historyLog.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded ${
                  log.includes('Swapping') || log.includes('moving') || log.includes('Placing') ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 
                  log.includes('Complete') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                  log.includes('Comparing') || log.includes('Scanning') ? 'text-slate-400' : 'text-slate-200'
                }`}
              >
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}