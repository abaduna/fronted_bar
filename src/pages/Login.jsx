import { useState } from 'react'
import api from '../api/config'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('barId', JSON.stringify(res.data.barId))
      navigate('/dashboard')
    } catch (err) {
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url('/barfondo.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      {/* Overlay negro */}
      <div style={{
        position: 'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }} />

      {/* Contenido */}
      <div 
        className="card bg-dark bg-opacity-75 text-white border-0 p-4"
        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '400px' }}
      >
        <h3 className="mb-4 text-center" style={{ 
          background: 'linear-gradient(to right, #8B5CF6, #EC4899)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Iniciar Sesión
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input 
              type="text" 
              className="form-control bg-dark text-white border-secondary" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
              autoFocus 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-control bg-dark text-white border-secondary" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn w-100" 
            disabled={loading}
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              padding: '10px 0',
              fontWeight: '600',
            }}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
