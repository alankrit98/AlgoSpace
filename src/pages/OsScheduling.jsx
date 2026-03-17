import { useState, useEffect } from 'react';
import { calculateFCFS, calculateSJF, calculateRR } from '../utils/scheduling';

const COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'
];

export default function OsScheduling() {
  const [processes, setProcesses] = useState([
    { id: 'P1', at: 0, bt: 5 },
    { id: 'P2', at: 1, bt: 3 },
    { id: 'P3', at: 2, bt: 8 },
    { id: 'P4', at: 3, bt: 6 },
  ]);
  
  const [newAT, setNewAT] = useState(0);
  const [newBT, setNewBT] = useState(1);
  const [algorithm, setAlgorithm] = useState("fcfs");
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [gantt, setGantt] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    runScheduler();
  }, [processes, algorithm, timeQuantum]);

  const runScheduler = () => {
    if (processes.length === 0) {
      setGantt([]);
      setResults([]);
      return;
    }
    
    let result;
    if (algorithm === "fcfs") result = calculateFCFS(processes);
    else if (algorithm === "sjf") result = calculateSJF(processes);
    else result = calculateRR(processes, timeQuantum); // ADDED RR HOOK
      
    setGantt(result.gantt);
    setResults(result.results);
  };

  const addProcess = (e) => {
    e.preventDefault();
    if (processes.length >= 8) return alert("Maximum 8 processes allowed for visibility.");
    
    const newProcess = {
      id: `P${processes.length + 1}`,
      at: parseInt(newAT),
      bt: parseInt(newBT)
    };
    setProcesses([...processes, newProcess]);
  };

  const clearProcesses = () => setProcesses([]);

  // Calculate Averages
  const avgTAT = results.length > 0 ? (results.reduce((acc, p) => acc + p.tat, 0) / results.length).toFixed(2) : 0;
  const avgWT = results.length > 0 ? (results.reduce((acc, p) => acc + p.wt, 0) / results.length).toFixed(2) : 0;
  const totalTime = gantt.length > 0 ? gantt[gantt.length - 1].end : 0;

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">CPU Scheduling Visualizer</h1>
          <p className="text-slate-400 mt-1">Visualize task execution via Gantt Charts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {algorithm === "rr" && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-md px-3 py-1">
              <label className="text-xs text-slate-400 font-bold">Quantum:</label>
              <input 
                type="number" min="1" max="10" 
                value={timeQuantum} 
                onChange={(e) => setTimeQuantum(parseInt(e.target.value) || 1)}
                className="w-12 bg-transparent text-white font-mono text-center focus:outline-none"
              />
            </div>
          )}
          <select 
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="fcfs">First-Come, First-Served (FCFS)</option>
            <option value="sjf">Shortest Job First (Non-Preemptive)</option>
            <option value="rr">Round Robin (Preemptive)</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Inputs */}
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 h-fit">
          <h2 className="text-lg font-bold mb-4 text-emerald-400">Process Queue</h2>
          
          <form onSubmit={addProcess} className="flex flex-col gap-3 mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Arrival Time (AT)</label>
                <input 
                  type="number" min="0" value={newAT} onChange={e => setNewAT(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" required
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400">Burst Time (BT)</label>
                <input 
                  type="number" min="1" value={newBT} onChange={e => setNewBT(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" required
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition font-medium">
              + Add Process
            </button>
          </form>

          <div className="space-y-2 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {processes.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
                <span className={`font-bold ${COLORS[idx % COLORS.length].replace('bg-', 'text-')}`}>{p.id}</span>
                <span className="text-sm text-slate-400">AT: {p.at} | BT: {p.bt}</span>
              </div>
            ))}
          </div>
          
          <button onClick={clearProcesses} className="w-full py-2 text-rose-400 hover:bg-rose-500/10 rounded transition text-sm font-medium">
            Clear All
          </button>
        </div>

        {/* Right Panel: Visualization & Metrics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Gantt Chart */}
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 overflow-x-auto">
            <h2 className="text-lg font-bold mb-4">Gantt Chart</h2>
            {gantt.length > 0 ? (
              <div className="flex h-16 w-full min-w-max">
                {gantt.map((block, index) => {
                  const duration = block.end - block.start;
                  const widthPercent = (duration / totalTime) * 100;
                  const processIdx = parseInt(block.id.replace('P', '')) - 1;
                  const bgColor = block.id === 'Idle' ? 'bg-slate-800 diagonal-stripes' : COLORS[processIdx % COLORS.length];

                  return (
                    <div 
                      key={index} 
                      className={`relative flex items-center justify-center border-r border-slate-950 shadow-inner ${bgColor} transition-all`}
                      style={{ width: `${Math.max(widthPercent, 5)}%` }} // Ensure even tiny blocks are visible
                    >
                      <span className="font-bold text-sm drop-shadow-md">{block.id}</span>
                      <span className="absolute -bottom-6 -left-2 text-xs text-slate-400">{block.start}</span>
                      {index === gantt.length - 1 && (
                        <span className="absolute -bottom-6 -right-2 text-xs text-slate-400">{block.end}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center text-slate-500 italic">No processes to schedule</div>
            )}
            <div className="mt-8 flex gap-6 text-sm">
              <p><span className="text-slate-400">Total Execution Time:</span> <span className="font-mono text-emerald-400">{totalTime}ms</span></p>
            </div>
          </div>

          {/* Metrics Table */}
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 overflow-x-auto">
            <h2 className="text-lg font-bold mb-4">Performance Metrics</h2>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Process</th>
                  <th className="pb-2">Arrival</th>
                  <th className="pb-2">Burst</th>
                  <th className="pb-2">Completion</th>
                  <th className="pb-2">Turnaround (TAT)</th>
                  <th className="pb-2">Waiting (WT)</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {results.map((r, idx) => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className={`py-3 font-bold ${COLORS[idx % COLORS.length].replace('bg-', 'text-')}`}>{r.id}</td>
                    <td className="py-3">{r.at}</td>
                    <td className="py-3">{r.bt}</td>
                    <td className="py-3">{r.ct}</td>
                    <td className="py-3">{r.tat}</td>
                    <td className="py-3">{r.wt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex gap-8">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Turnaround</span>
                <span className="text-xl font-bold text-indigo-400">{avgTAT} <span className="text-sm font-normal text-slate-500">ms</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Waiting</span>
                <span className="text-xl font-bold text-rose-400">{avgWT} <span className="text-sm font-normal text-slate-500">ms</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}