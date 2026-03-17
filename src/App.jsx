import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Sorting from './pages/Sorting';
import Pathfinding from './pages/Pathfinding';
import OsScheduling from './pages/OsScheduling';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Sorting />} />
          <Route path="graphs" element={<Pathfinding />} />
          <Route path="os" element={<OsScheduling />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}