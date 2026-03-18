import { useState, useEffect } from 'react';
import { solveNQueens } from '../utils/backtracking';

export default function Backtracking() {
  const [boardSize, setBoardSize] = useState(4);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(150); // ms per step

  const runVisualizer = () => {
    const result = solveNQueens(boardSize);
    setHistory(result);
    setCurrentStep(0);
    setIsRunning(true);
  };

  useEffect(() => {
    if (isRunning && currentStep < history.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentStep === history.length - 1) {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, history, speed]);

  const resetBoard = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsRunning(false);
  };

  const currentSnapshot = currentStep >= 0 ? history[currentStep] : null;
  const activeBoard = currentSnapshot ? currentSnapshot.board : Array(boardSize).fill().map(() => Array(boardSize).fill(false));

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Backtracking Algorithms</h1>
          <p className="text-slate-400 mt-1">Visualize the recursive N-Queens logical puzzle.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-bold text-slate-400">Board Size (N):</label>
          <input 
            type="number" min="4" max="8" value={boardSize} 
            onChange={e => {
              setBoardSize(parseInt(e.target.value) || 4);
              resetBoard();
            }}
            disabled={isRunning}
            className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button onClick={runVisualizer} disabled={isRunning} className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400 transition font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50">
            Start Simulation
          </button>
          <button onClick={resetBoard} disabled={isRunning} className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium border border-slate-700 disabled:opacity-50">
            Clear
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-lg border border-slate-800 flex flex-col items-center shadow-2xl">
        
        {/* Status Indicator */}
        <div className="h-8 mb-4 w-full flex justify-between items-center text-sm font-bold">
          <span className="text-slate-400">Step: {currentStep >= 0 ? currentStep : 0} / {history.length > 0 ? history.length - 1 : 0}</span>
          <span className={`
            ${currentSnapshot?.action === 'place' ? 'text-emerald-400' : ''}
            ${currentSnapshot?.action === 'remove' ? 'text-rose-400' : ''}
            ${currentSnapshot?.action === 'invalid' ? 'text-amber-400' : ''}
            ${currentSnapshot?.action === 'success' ? 'text-indigo-400 animate-pulse text-lg' : ''}
          `}>
            {currentSnapshot?.action === 'place' ? 'Placing Queen...' :
             currentSnapshot?.action === 'remove' ? 'Backtracking! Removing Queen...' :
             currentSnapshot?.action === 'invalid' ? 'Invalid Square. Trying next...' :
             currentSnapshot?.action === 'success' ? 'Solution Found!' : 'Awaiting start...'}
          </span>
        </div>

        {/* The Chessboard Grid */}
        <div 
          className="border-4 border-slate-800 shadow-2xl"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '500px',
            aspectRatio: '1 / 1'
          }}
        >
          {activeBoard.map((rowArr, rowIndex) => (
            rowArr.map((hasQueen, colIndex) => {
              // Standard chessboard alternating colors
              const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
              const squareColor = isDarkSquare ? "bg-slate-700" : "bg-slate-300";
              
              // Highlight the square being evaluated
              const isTargetSquare = currentSnapshot?.row === rowIndex && currentSnapshot?.col === colIndex;
              let highlightColor = "";
              if (isTargetSquare) {
                if (currentSnapshot.action === 'try') highlightColor = "ring-4 ring-inset ring-cyan-400 shadow-inner";
                if (currentSnapshot.action === 'invalid') highlightColor = "bg-rose-500/80";
                if (currentSnapshot.action === 'remove') highlightColor = "bg-rose-600 ring-4 ring-inset ring-rose-900";
              }

              return (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  className={`flex items-center justify-center relative transition-all duration-150 ${squareColor} ${highlightColor}`}
                >
                  {hasQueen && (
                    <span className="text-4xl sm:text-5xl drop-shadow-lg scale-in-center">
                      ♛
                    </span>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
}