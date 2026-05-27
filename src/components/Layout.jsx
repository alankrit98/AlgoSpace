import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Sorting Algorithms', path: '/sorting' }, // Updated Path
    { name: 'Trees (Data Structures)', path: '/trees' },
    { name: 'Backtracking (Logic)', path: '/backtracking' },
    { name: 'Pathfinding (Graphs)', path: '/graphs' },
    { name: 'CPU Scheduling (OS)', path: '/os' },
    { name: 'Memory Management (OS)', path: '/os-memory' },
    { name: 'Clustering (Machine Learning)', path: '/ml' },
    { name: 'String Searching (KMP)', path: '/strings' },
    { name: 'LinkedList Visualization', path: '/linked-list' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <a href="/"><h1 className="text-xl font-bold text-emerald-400">AlgoSpace</h1></a>
          <p className="text-xs text-slate-500 mt-1">Interactive CS Library</p>
        </div>
        
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto pb-8 no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`px-4 py-3 rounded-md transition font-medium ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* The Outlet is where your specific pages (Sorting, OS, etc.) will render */}
        <Outlet /> 
      </main>
    </div>
  );
}