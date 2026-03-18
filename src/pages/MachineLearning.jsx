import { useState, useEffect } from 'react';
import { assignClusters, recalculateCentroids } from '../utils/kmeans';

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6']; // Tailwind colors

export default function MachineLearning() {
  const [points, setPoints] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [k, setK] = useState(3);
  const [step, setStep] = useState(0);

  // Generate 150 random data points
  const generateData = () => {
    const newPoints = Array.from({ length: 150 }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 760 + 20, // Keep away from exact edges
      y: Math.random() * 460 + 20,
      cluster: -1,
    }));
    setPoints(newPoints);
    setCentroids([]);
    setStep(0);
  };

  // Drop random initial centroids
  const initializeCentroids = () => {
    if (points.length === 0) return alert("Generate data points first!");
    const initialCentroids = Array.from({ length: k }, () => {
      // Pick a random existing point to start the centroid
      const randomPoint = points[Math.floor(Math.random() * points.length)];
      return { x: randomPoint.x, y: randomPoint.y };
    });
    setCentroids(initialCentroids);
    setStep(1);
    
    // Immediately color the points based on initial placement
    setPoints(assignClusters(points, initialCentroids));
  };

  // Run one iteration of K-Means
  const runIteration = () => {
    if (centroids.length === 0) return;
    
    // Move centroids to the center of their clusters
    const newCentroids = recalculateCentroids(points, k, centroids);
    setCentroids(newCentroids);
    
    // Reassign points based on the new centroid positions
    setPoints(assignClusters(points, newCentroids));
    setStep(prev => prev + 1);
  };

  useEffect(() => {
    generateData();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">K-Means Clustering (ML)</h1>
          <p className="text-slate-400 mt-1">Visualize unsupervised machine learning.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-bold text-slate-400 mr-2">Clusters (K):</label>
          <input 
            type="number" min="2" max="5" value={k} 
            onChange={e => setK(parseInt(e.target.value) || 3)}
            className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-white focus:outline-none focus:border-indigo-500 text-center"
          />
          <button onClick={generateData} className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium border border-slate-700 ml-2">
            1. Scatter Data
          </button>
          <button onClick={initializeCentroids} disabled={centroids.length > 0} className="px-4 py-2 bg-indigo-500 rounded-md hover:bg-indigo-400 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            2. Drop Centroids
          </button>
          <button onClick={runIteration} disabled={centroids.length === 0} className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-400 transition font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50">
            3. Step Forward
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full bg-slate-900 rounded-lg border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm bg-slate-950/50 px-3 py-1 rounded">
          Iteration: {step}
        </div>
        
        <div className="flex justify-center w-full overflow-x-auto">
          <svg width="800" height="500" className="bg-slate-900 min-w-[800px]">
            {/* Draw Data Points */}
            {points.map(point => (
              <circle 
                key={point.id} 
                cx={point.x} cy={point.y} r="6" 
                fill={point.cluster !== -1 ? COLORS[point.cluster] : "#475569"} // slate-600
                className="transition-colors duration-500 opacity-80"
              />
            ))}
            
            {/* Draw Centroids (Magnets) on top */}
            {centroids.map((centroid, idx) => (
              <g key={`centroid-${idx}`} className="transition-all duration-700 ease-out">
                {/* Outer Glow */}
                <circle cx={centroid.x} cy={centroid.y} r="25" fill={COLORS[idx]} className="opacity-20 animate-pulse" />
                {/* Hard Center */}
                <path 
                  d={`M ${centroid.x} ${centroid.y - 12} L ${centroid.x + 12} ${centroid.y} L ${centroid.x} ${centroid.y + 12} L ${centroid.x - 12} ${centroid.y} Z`}
                  fill="#ffffff" 
                  stroke={COLORS[idx]} 
                  strokeWidth="3"
                  className="drop-shadow-2xl"
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}