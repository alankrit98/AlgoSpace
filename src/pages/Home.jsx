import { Link } from 'react-router-dom';

export default function Home() {
  const modules = [
    {
      title: "Sorting Algorithms",
      desc: "Visualize Time & Space complexity in real-time with Merge, Quick, and Bubble sort.",
      path: "/sorting",
      color: "from-blue-500 to-cyan-500",
      icon: "📊"
    },
    {
      title: "Pathfinding (Graphs)",
      desc: "Watch BFS, DFS, and A* Search navigate walls and weighted terrain to find the shortest path.",
      path: "/graphs",
      color: "from-emerald-500 to-teal-500",
      icon: "🗺️"
    },
    {
      title: "CPU Scheduling (OS)",
      desc: "Interactive Gantt charts demonstrating FCFS, SJF, and preemptive Round Robin algorithms.",
      path: "/os",
      color: "from-purple-500 to-indigo-500",
      icon: "⚙️"
    },
    {
      title: "Trees (Data Structures)",
      desc: "Dynamically insert nodes to build and balance a Binary Search Tree.",
      path: "/trees",
      color: "from-rose-500 to-orange-500",
      icon: "🌳"
    },
    {
      title: "Machine Learning",
      desc: "Scatter data and watch K-Means Clustering mathematically converge on centroids.",
      path: "/ml",
      color: "from-amber-400 to-yellow-500",
      icon: "🤖"
    }
  ];

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-6 sm:p-12 font-sans text-white overflow-y-auto custom-scrollbar">
      
      {/* Hero Section */}
      <div className="w-full max-w-5xl text-center mt-8 mb-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AlgoSpace</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An interactive, high-performance visualization library. 
          Explore the mechanics of computer science through real-time DOM manipulation and mathematical rendering.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {modules.map((mod, idx) => (
          <Link 
            key={idx} 
            to={mod.path}
            className="group relative bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50 flex flex-col h-full overflow-hidden"
          >
            {/* Top Gradient Accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mod.color} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className="text-4xl mb-4">{mod.icon}</div>
            <h2 className="text-xl font-bold mb-2 text-slate-100 group-hover:text-white">{mod.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed flex-1">{mod.desc}</p>
            
            <div className="mt-6 flex items-center text-sm font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
              Launch Module <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
      
    </div>
  );
}