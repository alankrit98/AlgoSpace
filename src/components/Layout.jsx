import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// 1. The Parent Container (Orchestrates the stagger)
const sidebarVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms delay between each link for a snappy feel
      delayChildren: 0.1     // Tiny pause before starting the cascade
    }
  }
};

// 2. The Individual Links (Defines the actual movement)
const linkVariants = {
  hidden: { opacity: 0, x: -15 }, // Start invisible and slightly shifted left
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { ease: "easeOut", duration: 0.3 } 
  }
};

// Advanced Trick: This turns the react-router Link into an animated Framer Motion component!
const AnimatedLink = motion(Link);

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Sorting Algorithms', path: '/sorting' },
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
        
        {/* UPGRADED: Changed to motion.div to pass the orchestration down to the links */}
        <motion.div 
          variants={sidebarVariants}
          initial="hidden"
          animate="show"
          className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto pb-8 no-scrollbar"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <AnimatedLink 
                key={item.path} 
                to={item.path}
                variants={linkVariants} // Connects individual animation rules
                whileHover={{ x: 4, transition: { duration: 0.2 } }} // Glides right on hover
                whileTap={{ scale: 0.98 }} // Depresses slightly when clicked
                className={`px-4 py-3 rounded-md transition-colors font-medium ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {item.name}
              </AnimatedLink>
            );
          })}
        </motion.div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-950">
        
        {/* AnimatePresence allows components to animate OUT before disappearing */}
        <AnimatePresence mode="wait">
          
          {/* We use location.pathname as the key so React knows exactly when the route changes */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-full"
          >
            <Outlet /> 
          </motion.div>
          
        </AnimatePresence>
        
      </main>
    </div>
  );
}