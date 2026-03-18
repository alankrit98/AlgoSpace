import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sorting from './pages/Sorting';
import Pathfinding from './pages/Pathfinding';
import OsScheduling from './pages/OsScheduling';
import DataStructures from './pages/DataStructures';
import MachineLearning from './pages/MachineLearning';
import MemoryManagement from './pages/MemoryManagement';
import Backtracking from './pages/Backtracking';
import StringMatching from './pages/StringMatching';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} /> {/* Home is now the default page */}
          <Route path="sorting" element={<Sorting />} /> {/* Moved to /sorting */}
          <Route path="graphs" element={<Pathfinding />} />
          <Route path="os" element={<OsScheduling />} />
          <Route path="trees" element={<DataStructures />} />
          <Route path="ml" element={<MachineLearning />} />
          <Route path="os-memory" element={<MemoryManagement />} />
          <Route path="backtracking" element={<Backtracking />} />
          <Route path="strings" element={<StringMatching />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}