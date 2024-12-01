import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BarDetail from './pages/BarDetail'
import Dashboard from './pages/Dashboard'
import ListaDashboard from './pages/ListaDashboard'
import Horarios from './pages/Horarios'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/bar/:id" element={<BarDetail />} />
      <Route path="/dashboard/:id" element={<Dashboard />} />
      <Route path="/lista/dashboard/:id" element={<ListaDashboard />} />
      <Route path="/horarios/:id" element={<Horarios />} />
    </Routes>
  )
}

export default App
