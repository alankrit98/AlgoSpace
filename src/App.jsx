// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Sorting from './pages/Sorting';
import Pathfinding from './pages/Pathfinding'; // Import the new page

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full text-slate-500 text-2xl font-bold">
    {title} Module Coming Soon...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Sorting />} />
          {/* Inject the Pathfinding component here */}
          <Route path="graphs" element={<Pathfinding />} /> 
          <Route path="os" element={<Placeholder title="CPU Scheduling" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}