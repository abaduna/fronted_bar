import { Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Home from './pages/Home'
import BarDetail from './pages/BarDetail'
import Dashboard from './pages/Dashboard'
import ListaDashboard from './pages/ListaDashboard'
import Horarios from './pages/Horarios'
import CrearMesa from './pages/addMesa'
import CrearZona from './pages/CrearZona'
function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Dame mi mesa</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/1">Dashboard</Link>
              </li>
            
              <li className="nav-item">
                <Link className="nav-link" to="/horarios/1">Horarios</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/add-mesa">mesa</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/crear-zona">Crear Zona</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bar/:id" element={<BarDetail />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/lista/dashboard/:id" element={<ListaDashboard />} />
        <Route path="/horarios/:id" element={<Horarios />} />
        <Route path="/add-mesa" element={<CrearMesa />} />
        <Route path="/crear-zona" element={<CrearZona />} />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </>
  )
}

export default App
