import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const linkVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { ease: "easeOut", duration: 0.3 } }
};

const AnimatedLink = motion(Link);

export default function Layout() {
  const location = useLocation();
  // NEW: State to track if the mobile menu is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Helper to close the menu when a link is clicked on mobile
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      
      {/* --- NEW: MOBILE TOP BAR (Only visible on small screens) --- */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <a href="/" className="text-xl font-bold text-emerald-400">AlgoSpace</a>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 text-slate-300 hover:text-white outline-none"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* --- NEW: MOBILE OVERLAY (Darkens the background when menu is open) --- */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* --- UPDATED: RESPONSIVE SIDEBAR --- */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <a href="/"><h1 className="text-xl font-bold text-emerald-400">AlgoSpace</h1></a>
          <p className="text-xs text-slate-500 mt-1">Interactive CS Library</p>
        </div>
        
        <motion.div 
          variants={sidebarVariants}
          initial="hidden"
          animate="show"
          className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto pb-8 no-scrollbar mt-16 md:mt-0"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <AnimatedLink 
                key={item.path} 
                to={item.path}
                onClick={closeMobileMenu} // Automatically close menu on click!
                variants={linkVariants}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
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
      {/* UPDATED: Added pt-16 on mobile to push content below the new top bar */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-950 pt-16 md:pt-0">
        <AnimatePresence mode="wait">
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