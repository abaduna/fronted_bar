
import { useState, useEffect } from 'react'
import api from '../api/config'

function Horarios() {
const id = localStorage.getItem('barId') || '';
  const [horariosPorDia, setHorariosPorDia] = useState(
    Array(7).fill().map(() => [])
  )
  const [expandedRows, setExpandedRows] = useState(Array(7).fill(false))
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  
const diasSemana = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]


  const handleRowClick = (index) => {
    const newExpandedRows = [...expandedRows]
    newExpandedRows[index] = !newExpandedRows[index]
    setExpandedRows(newExpandedRows)
  }

  const agregarHorario = (diaIndex) => {
    const nuevosHorarios = [...horariosPorDia]
    nuevosHorarios[diaIndex] = [...nuevosHorarios[diaIndex], { inicio: '', fin: '' }]
    setHorariosPorDia(nuevosHorarios)
  }

  const handleHorarioChange = (diaIndex, horarioIndex, tipo, valor) => {
    const nuevosHorarios = [...horariosPorDia]
    nuevosHorarios[diaIndex][horarioIndex][tipo] = valor
    setHorariosPorDia(nuevosHorarios)
  }

  const obtenerHorariosFormateados = () => {
    const horarios = {}
    diasSemana.forEach((dia, index) => {
      const diaFormateado = dia.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      
      horarios[diaFormateado] = horariosPorDia[index].map(horario => 
        `${horario.inicio}-${horario.fin}`
      )
    })
    console.log(horarios)
    return horarios
  }

  const guardarHorarios = async () => {
    try {
      const horarios = obtenerHorariosFormateados()
      
      const response = await api.post(`/api/schedule/bars/${id}/weekly-schedule`, {
        domingo: horarios.domingo || [],
        lunes: horarios.lunes || [],
        martes: horarios.martes || [],
        miercoles: horarios.miercoles || [],
        jueves: horarios.jueves || [],
        viernes: horarios.viernes || [],
        sabado: horarios.sabado || [],
       
      })

      if (response.status === 200) {
        setAlert({
          show: true,
          message: 'Horarios guardados exitosamente',
          type: 'success'
        });
        
        // Auto hide alert after 3 seconds
        setTimeout(() => {
          setAlert({ show: false, message: '', type: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.status === 400 
        ? error.response.data.message 
        : 'Error al guardar los horarios';

      setAlert({
        show: true,
        message: errorMessage,
        type: 'danger'
      });
      
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const eliminarHorario = (diaIndex, horarioIndex) => {
    const nuevosHorarios = [...horariosPorDia];
    nuevosHorarios[diaIndex].splice(horarioIndex, 1);
    setHorariosPorDia(nuevosHorarios);
  };
useEffect(() => {
  api.get(`/api/schedule/bars/${id}/schedule`)
    .then(res => {
      const data = res.data;

      const horariosIniciales = Array(7).fill().map(() => []);
      const expandedIniciales = Array(7).fill(false);

      data.forEach(dia => {
        // 🔥 Mapeo dayOfWeek 7 a 0 (domingo)
        const index = dia.dayOfWeek === 7 ? 0 : dia.dayOfWeek;

        if (dia.timeRanges) {
          horariosIniciales[index] = dia.timeRanges.map(rango => ({
            inicio: rango.startTime,
            fin: rango.endTime
          }));
          expandedIniciales[index] = true;
        }
      });

      setHorariosPorDia(horariosIniciales);
      setExpandedRows(expandedIniciales);
    })
    .catch(err => {
      console.error("Error al obtener los horarios:", err);
    });
}, [id]);



  return (
    <div className="container-fluid min-vh-100" 
      style={{
  backgroundImage: `url('/barfondo.webp')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  position: 'relative'
}}
>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }}></div>
      
      <div className="container py-5" style={{ position: 'relative', zIndex: 2 }}>
        <div className="card bg-dark bg-opacity-75 text-white border-0 p-4">
          <h1 className="h2 mb-4 text-white">Grilla de horarios</h1>
          
          {diasSemana.map((dia, index) => (
            <div key={index} className="mb-3">
              <button 
                onClick={() => handleRowClick(index)}
                className="btn"
                style={{
                  background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px'
                }}
              >
                <i className="bi bi-clock me-2"></i>{dia}
              </button>
              
              {expandedRows[index] && (
                <div className="mt-3 card bg-dark bg-opacity-50 p-3 border-secondary">
                  {horariosPorDia[index].map((horario, horarioIndex) => (
                    <div key={horarioIndex} className="row g-3 mb-2">
                      <div className="col-md-5">
                        <div className="form-group">
                          <label className="form-label text-white">Inicio</label>
                          <input 
                            type="time" 
                            className="form-control bg-dark text-white border-secondary"
                            value={horario.inicio}
                            onChange={(e) => handleHorarioChange(index, horarioIndex, 'inicio', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div className="form-group">
                          <label className="form-label text-white">Fin</label>
                          <input 
                            type="time" 
                            className="form-control bg-dark text-white border-secondary"
                            value={horario.fin}
                            onChange={(e) => handleHorarioChange(index, horarioIndex, 'fin', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <button 
                          className="btn btn-danger mb-2"
                          onClick={() => eliminarHorario(index, horarioIndex)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    className="btn mt-3"
                    onClick={() => agregarHorario(index)}
                    style={{
                      background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px'
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Agregar horario
                  </button>
                </div>
              )}
            </div>
          ))}

          {alert.show && (
            <div className={`alert fade show position-fixed top-0 start-50 translate-middle-x mt-3`} 
              style={{
                background: alert.type === 'success' ? 'linear-gradient(to right, #10B981, #059669)' : 'linear-gradient(to right, #EF4444, #DC2626)',
                color: 'white',
                borderRadius: '8px',
                padding: '1rem 2rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 9999
              }}
            >
              <i className={`bi ${alert.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
              {alert.message}
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setAlert({ show: false, message: '', type: '' })}
                aria-label="Close"
              ></button>
            </div>
          )}

          <button 
            className="btn mt-4"
            onClick={guardarHorarios}
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              padding: '10px 20px'
            }}
          >
            <i className="bi bi-save me-2"></i>Guardar Horarios
          </button>
        </div>
      </div>
    </div>
  )
}

export default Horarios 