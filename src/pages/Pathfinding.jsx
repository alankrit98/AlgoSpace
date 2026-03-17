import { useState, useEffect } from 'react';
import { bfs, dfs, getNodesInShortestPathOrder } from '../utils/pathfinding';
import { generateRandomMaze } from '../utils/maze';

const ROWS = 20;
const COLS = 40; 

export default function Pathfinding() {
  const [grid, setGrid] = useState([]);
  const [mouseMode, setMouseMode] = useState("idle"); // "wall", "start", "finish", or "idle"
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState("bfs");

  // Dynamic state for Start and Finish nodes
  const [startPos, setStartPos] = useState({ row: 10, col: 5 });
  const [finishPos, setFinishPos] = useState({ row: 10, col: 35 });

  useEffect(() => {
    initializeGrid();
  }, [startPos, finishPos]); // Re-render grid if start/finish nodes are dragged

  const initializeGrid = (preserveWalls = false) => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        const isWall = preserveWalls && grid.length > 0 ? grid[row][col].isWall : false;
        currentRow.push({
          col,
          row,
          isStart: row === startPos.row && col === startPos.col,
          isFinish: row === finishPos.row && col === finishPos.col,
          isWall: isWall,
          isVisited: false,
          previousNode: null,
        });
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
    
    // Reset visual DOM classes
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (node) {
          const isStart = row === startPos.row && col === startPos.col;
          const isFinish = row === finishPos.row && col === finishPos.col;
          const isWall = preserveWalls && grid.length > 0 ? grid[row][col].isWall : false;
          node.className = getInitialNodeClasses({ isStart, isFinish, isWall });
        }
      }
    }
  };

  const getInitialNodeClasses = (node) => {
    const base = "w-4 h-4 sm:w-5 sm:h-5 m-[1px] rounded-sm transition-all duration-200 cursor-pointer ";
    if (node.isStart) return base + "bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/50 z-10 hover:scale-125";
    if (node.isFinish) return base + "bg-rose-500 scale-110 shadow-lg shadow-rose-500/50 z-10 hover:scale-125";
    if (node.isWall) return base + "bg-slate-300 scale-105";
    return base + "bg-slate-800 hover:bg-slate-700"; 
  };

  // --- MOUSE EVENTS (Dragging & Walls) ---
  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    
    if (row === startPos.row && col === startPos.col) {
      setMouseMode("start");
    } else if (row === finishPos.row && col === finishPos.col) {
      setMouseMode("finish");
    } else {
      setMouseMode("wall");
      setGrid(toggleWall(grid, row, col));
    }
  };

  const handleMouseEnter = (row, col) => {
    if (mouseMode === "idle" || isRunning) return;

    if (mouseMode === "start") {
      setStartPos({ row, col });
    } else if (mouseMode === "finish") {
      setFinishPos({ row, col });
    } else if (mouseMode === "wall") {
      setGrid(toggleWall(grid, row, col));
    }
  };

  const handleMouseUp = () => setMouseMode("idle");

  const toggleWall = (currentGrid, row, col) => {
    const newGrid = currentGrid.slice();
    const node = newGrid[row][col];
    if (node.isStart || node.isFinish) return newGrid;
    newGrid[row][col] = { ...node, isWall: !node.isWall };
    return newGrid;
  };

  // --- ANIMATIONS ---
  const animateMaze = () => {
    if (isRunning) return;
    setIsRunning(true);
    initializeGrid(false); // Clear board first
    
    const wallsToAnimate = generateRandomMaze(grid, startPos, finishPos);
    
    for (let i = 0; i < wallsToAnimate.length; i++) {
      setTimeout(() => {
        const node = wallsToAnimate[i];
        
        // Update DOM
        document.getElementById(`node-${node.row}-${node.col}`).className = 
          "w-4 h-4 sm:w-5 sm:h-5 m-[1px] rounded-sm bg-slate-300 scale-105 transition-all duration-200";
        
        // Update State behind the scenes
        setGrid(prev => {
          const newGrid = prev.slice();
          newGrid[node.row][node.col].isWall = true;
          return newGrid;
        });

        if (i === wallsToAnimate.length - 1) setIsRunning(false);
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className = 
            "w-4 h-4 sm:w-5 sm:h-5 m-[1px] rounded-sm bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/50 transition-all duration-300";
        }
        if (i === nodesInShortestPathOrder.length - 1) setIsRunning(false);
      }, 50 * i); 
    }
  };

  const runPathfinder = () => {
    if (isRunning) return;
    setIsRunning(true);
    initializeGrid(true); // Clear old paths, keep walls
    
    const gridCopy = grid.map(row => row.map(node => ({...node})));
    const startNode = gridCopy[startPos.row][startPos.col];
    const finishNode = gridCopy[finishPos.row][finishPos.col];
    
    // Switchboard for algorithms
    const visitedNodesInOrder = algorithm === "bfs" 
      ? bfs(gridCopy, startNode, finishNode)
      : dfs(gridCopy, startNode, finishNode);

    // Check if the finish node was actually found!
    const finishNodeTarget = visitedNodesInOrder[visitedNodesInOrder.length - 1];
    if (finishNodeTarget !== finishNode) {
       // If the last node it checked wasn't the finish node, it failed to find a path.
       setTimeout(() => alert("No path possible!"), 10 * visitedNodesInOrder.length);
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className = 
            "w-4 h-4 sm:w-5 sm:h-5 m-[1px] rounded-full bg-cyan-500 scale-125 transition-all duration-500 ease-out";
            
          setTimeout(() => {
             const el = document.getElementById(`node-${node.row}-${node.col}`);
             if(el) el.className = "w-4 h-4 sm:w-5 sm:h-5 m-[1px] rounded-sm bg-cyan-800 transition-all duration-1000";
          }, 300);
        }
      }, 10 * i); 
    }
  };

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pathfinding Visualizer</h1>
          <p className="text-slate-400 mt-1">Drag nodes, draw walls, or generate a maze.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => initializeGrid(false)}
            disabled={isRunning}
            className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium border border-slate-700 disabled:opacity-50"
          >
            Clear Board
          </button>
          <button 
            onClick={animateMaze}
            disabled={isRunning}
            className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium border border-slate-700 disabled:opacity-50"
          >
            Generate Maze
          </button>
          
          <div className="flex gap-2">
            <select 
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isRunning}
              className="bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
            </select>
            <button 
              onClick={runPathfinder}
              disabled={isRunning}
              className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400 transition font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              Run Algorithm
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-full overflow-x-auto pb-4">
        <div 
          className="inline-block bg-slate-900 p-2 rounded-lg border border-slate-800 shadow-2xl min-w-max"
          onMouseLeave={handleMouseUp} 
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((node, nodeIdx) => {
                const { row, col } = node;
                return (
                  <div
                    key={`${row}-${col}`}
                    id={`node-${row}-${col}`} 
                    onMouseDown={() => handleMouseDown(row, col)}
                    onMouseEnter={() => handleMouseEnter(row, col)}
                    onMouseUp={handleMouseUp}
                    className={getInitialNodeClasses(node)}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}