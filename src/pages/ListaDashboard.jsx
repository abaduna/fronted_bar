
import { useState } from 'react';
import api from '../api/config';

function ListaDashboard() {
const id = localStorage.getItem('barId') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [noReservations, setNoReservations] = useState(false);

  const fetchReservaciones = async () => {
    try {
      setLoading(true);
      setNoReservations(false);
      const fechaCompleta = `${selectedDate}`;
      const response = await api.get(`/api/reservaciones/cantidad/${id}?fechaDeLareserva=${fechaCompleta}`);
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener reservaciones:', error);
      if (error.response && error.response.status === 404) {
        setNoReservations(true);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container py-4">
      {showAlert && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
          <i className="bi bi-check-circle me-2"></i>Reservación eliminada con éxito
          <button type="button" className="btn-close" onClick={() => setShowAlert(false)} aria-label="Close"></button>
        </div>
      )}

      {noReservations && (
        <div className="alert alert-info shadow-sm" role="alert">
          <i className="bi bi-info-circle me-2"></i>No hay reservaciones para la fecha seleccionada
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">
            <i className="bi bi-calendar3 me-2"></i>
            Dashboard Lista {id}
          </h2>
          
          <div className="row align-items-end g-3">
            <div className="col-md-8">
              <label htmlFor="date" className="form-label">Fecha de Reserva:</label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-primary w-100"
                onClick={fetchReservaciones}
                disabled={!selectedDate}
              >
                <i className="bi bi-search me-2"></i>
                Buscar Reservaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
      
      {data && (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Horario</th>
                  <th className="px-4">Mesa</th>
                  <th className="px-4">Personas</th>
                  <th className="px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4">
                      <i className="bi bi-clock me-2"></i>
                      {new Date(item.horario).toLocaleTimeString()}
                    </td>
                    <td className="px-4">
                      <i className="bi bi-diagram-2 me-2"></i>
                      {item.idMesa ? item.idMesa.split('-')[1] : 'No asignada'}
                    </td>
                    <td className="px-4">
                      <i className="bi bi-people me-2"></i>
                      {item.cantidadDePersonas || 'No especificada'}
                    </td>
                    <td className="px-4">
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Eliminar
                        </button>
                        <a 
                          href={`https://wa.me/${item.phone}?text=${encodeURIComponent(
                            `Hola me comunico del bar por tu reserva de la fecha ${new Date(item.horario).toLocaleDateString()} y te comento que...`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm"
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
    </div>
  );
}

export default ListaDashboard; 