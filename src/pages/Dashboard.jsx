import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { barService } from "../api/barService"
import '../Css/home.css'
import api from '../api/config';
function Dashboard() {
  const { id } = useParams()
  const [selectedOption, setSelectedOption] = useState('crear-mesa')
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [mesaData, setMesaData] = useState({
    idZona: '',
    idBar: Number(id),
    maximo: 0
  })
  const [success, setSuccess] = useState(false)
  const [zonaData, setZonaData] = useState({
    name: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    fecha: '',
    hora: ''
  })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [noReservations, setNoReservations] = useState(false)
  const [showZoneSelection, setShowZoneSelection] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');
  const [zonas, setZonas] = useState([]);

  const handleCreate = async () => {
    try {
      setError(null)
      setSuccess(false)
      if (selectedOption === 'crear-mesa') {
        setShowModal(true)
      } else {
        setShowZonaModal(true)
      }
    } catch (error) {
      console.error('Error al crear:', error)
      setError('Hubo un error al crear. Por favor, intente nuevamente.')
    }
  }

  const handleSubmitMesa = async (e) => {
    e.preventDefault()
    try {
      const response = await barService.createMesa(mesaData)
      if (response.status === 201) {
        setSuccess(true)
        setShowModal(false)
        setMesaData({ idZona: '', idBar: Number(id), maximo: 0 })
        setError(null)
      }
    } catch (error) {
      console.error('Error al crear mesa:', error)
      setError('Hubo un error al crear la mesa. Por favor, intente nuevamente.')
    }
  }

  const handleSubmitZona = async (e) => {
    e.preventDefault()
    try {
      const response = await barService.createZona(id, zonaData)
      if (response.status === 201) {
        setSuccess(true)
        setShowZonaModal(false)
        setZonaData({ name: '' })
        setError(null)
      }
    } catch (error) {
      console.error('Error al crear zona:', error)
      setError('Hubo un error al crear la zona. Por favor, intente nuevamente.')
    }
  }
  const fetchReservaciones = async () => {
    try {
      setLoading(true)
      setNoReservations(false)
      const fechaCompleta = selectedDate
      const response = await api.get(`/api/reservaciones/cantidad/${id}?fechaDeLareserva=${fechaCompleta}`)
      setData(response.data)
      console.log(response.data)
    } catch (error) {
      console.error('Error al obtener reservaciones:', error)
      if (error.response && error.response.status === 404) {
        setNoReservations(true)
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/reservaciones/eliminar/${id}`);
      setShowAlert(true);
      fetchReservaciones();
      setTimeout(() => setShowAlert(false), 3000);
      fetchReservaciones()
    } catch (error) {
      console.error('Error al eliminar la reservación:', error);
    }
  };

  const handleZoneButtonClick = () => {
    setShowZoneSelection(!showZoneSelection);
  };

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await barService.getZonas(id);
        setZonas(response.data);
      } catch (error) {
        console.error('Error fetching zonas:', error);
      }
    };
    fetchZonas();
  }, [id]);

  return (
    <div className="container-fluid min-vh-100" 
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative'
      }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }}></div>

      <div className="container py-4" style={{ position: 'relative', zIndex: 2 }}>
        {/* Success Alert */}
        {success && (
          <div className="alert fade show position-fixed top-0 start-50 translate-middle-x mt-3" 
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
              color: 'white',
              borderRadius: '8px',
              padding: '1rem 2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 9999
            }}>
            <i className="bi bi-check-circle me-2"></i>¡Agregado con éxito!
            <button type="button" className="btn-close btn-close-white" onClick={() => setSuccess(false)}></button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert fade show position-fixed top-0 start-50 translate-middle-x mt-3"
            style={{
              background: 'linear-gradient(to right, #EF4444, #B91C1C)',
              color: 'white',
              borderRadius: '8px',
              padding: '1rem 2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 9999
            }}>
            <i className="bi bi-exclamation-circle me-2"></i>{error}
            <button type="button" className="btn-close btn-close-white" onClick={() => setError(null)}></button>
          </div>
        )}

        <div className="card shadow-sm mb-4 bg-dark bg-opacity-75 text-white border-0">
          <div className="card-body">
            <h2 className="card-title text-center mb-4 text-white">
              <i className="bi bi-gear me-2"></i>
              Panel de Administración
            </h2>
            
            <div className="row align-items-end g-3">
              <div className="col-md-8">
                <label className="form-label text-white">Seleccione una opción:</label>
                <select 
                  className="form-control bg-dark text-white border-secondary"
                  value={selectedOption} 
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="crear-zona">Crear Zona</option>
                </select>
              </div>
            
              <div className="col-md-4">
                <button 
                  className="btn w-100"
                  onClick={handleCreate}
                  style={{
                    background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mesa Modal */}
        {showModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-table me-2"></i>Crear Nueva Mesa
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmitMesa}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">ID de la Zona:</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={mesaData.idZona}
                        onChange={(e) => setMesaData({...mesaData, idZona: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Máximo de Comensales:</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        value={mesaData.maximo}
                        onChange={(e) => setMesaData({...mesaData, maximo: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-2"></i>Crear Mesa
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Zona Modal */}
        {showZonaModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-grid me-2"></i>Crear Nueva Zona
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowZonaModal(false)}></button>
                </div>
                <form onSubmit={handleSubmitZona}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Nombre de la Zona:</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={zonaData.name}
                        onChange={(e) => setZonaData({...zonaData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowZonaModal(false)}>
                      <i className="bi bi-x-circle me-2"></i>Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-2"></i>Crear Zona
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <div className="container py-4">
        {showAlert && (
          <div className="alert fade show position-fixed top-0 start-50 translate-middle-x mt-3" 
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
              color: 'white',
              borderRadius: '8px',
              padding: '1rem 2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 9999
            }}>
            <i className="bi bi-check-circle me-2"></i>Reservación eliminada con éxito
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowAlert(false)}></button>
          </div>
        )}

        {noReservations && (
          <div className="alert fade show mb-4" 
            style={{
              background: 'linear-gradient(to right, #3B82F6, #2563EB)',
              color: 'white',
              borderRadius: '8px',
              padding: '1rem 2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
            <i className="bi bi-info-circle me-2"></i>No hay reservaciones para la fecha seleccionada
          </div>
        )}

        <div className="card shadow-sm mb-4 bg-dark bg-opacity-75 text-white border-0">
          <div className="card-body">
            <h2 className="card-title text-center mb-4 text-white">
              <i className="bi bi-calendar3 me-2"></i>
              Reservas
            </h2>
            
            <div className="row align-items-end g-3">
              <div className="col-md-8">
                <label htmlFor="date" className="form-label text-white">Fecha de Reserva:</label>
                <input
                  type="date"
                  id="date"
                  className="form-control bg-dark text-white border-secondary"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button 
                  className="btn w-100"
                  onClick={fetchReservaciones}
                  disabled={!selectedDate}
                  style={{
                    background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <i className="bi bi-search me-2"></i>
                  Buscar Reservaciones
                </button>
              </div>
            </div>
          </div>
        </div>

        {data && (
          <div className="card shadow-sm bg-dark bg-opacity-75 text-white border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-white">
                <thead>
                  <tr className="border-bottom border-secondary">
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Personas</th>
                    <th className="px-4 py-3">Zona</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-bottom border-secondary">
                      <td className="px-4 py-3">
                        <i className="bi bi-clock me-2"></i>
                        {item.fechaHora.split('T')[1]}
                      </td>
                      <td className="px-4 py-3">
                        <i className="bi bi-person me-2"></i>
                        {item.nombre || 'No especificado'}
                      </td>
                      <td className="px-4 py-3">
                        <i className="bi bi-people me-2"></i>
                        {item.cantidadDeSillasUtlizadas || 'No especificada'}
                      </td>
                      <td className="px-4 py-3">
                        <i className="bi bi-geo-alt me-2"></i>
                        {item.nameZona || 'No especificada'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm"
                            onClick={() => handleDelete(item.id)}
                            style={{
                              background: 'linear-gradient(to right, #EF4444, #B91C1C)',
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Eliminar
                          </button>
                          <a 
                            href={`https://wa.me/${item.phone}?text=${encodeURIComponent(
                              `Hola me comunico del bar por tu reserva de la fecha ${new Date(item.fechaHora).toLocaleDateString()} y te comento que...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{
                              background: 'linear-gradient(to right, #10B981, #059669)',
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="bi bi-whatsapp me-1"></i>
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border" role="status" style={{ color: '#EC4899' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default Dashboard 