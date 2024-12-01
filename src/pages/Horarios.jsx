import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api/config'

function Horarios() {
  const { id } = useParams()
  const [horariosPorDia, setHorariosPorDia] = useState(
    Array(7).fill().map(() => [])
  )
  const [expandedRows, setExpandedRows] = useState(Array(7).fill(false))
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  
  const diasSemana = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
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
        lunes: horarios.lunes || [],
        martes: horarios.martes || [],
        miercoles: horarios.miercoles || [],
        jueves: horarios.jueves || [],
        viernes: horarios.viernes || [],
        sabado: horarios.sabado || [],
        domingo: horarios.domingo || []
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
      setAlert({
        show: true,
        message: 'Error al guardar los horarios',
        type: 'danger'
      });
      
      // Auto hide alert after 3 seconds
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  return (
    <div className="container p-4">
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ show: false, message: '', type: '' })}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <h1 className="h2 mb-4">Horarios para ID: {id}</h1>
      
      {diasSemana.map((dia, index) => (
        <div key={index} className="mb-3">
          <button 
            onClick={() => handleRowClick(index)}
            className="btn btn-primary"
          >
            + {dia}
          </button>
          
          {expandedRows[index] && (
            <div className="mt-2">
              {horariosPorDia[index].map((horario, horarioIndex) => (
                <div key={horarioIndex} className="row g-3 mb-2">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Inicio</label>
                      <input 
                        type="time" 
                        className="form-control"
                        value={horario.inicio}
                        onChange={(e) => handleHorarioChange(index, horarioIndex, 'inicio', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Fin</label>
                      <input 
                        type="time" 
                        className="form-control"
                        value={horario.fin}
                        onChange={(e) => handleHorarioChange(index, horarioIndex, 'fin', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-secondary mt-2"
                onClick={() => agregarHorario(index)}
              >
                Agregar horario
              </button>
            </div>
          )}
        </div>
      ))}

      <button 
        className="btn btn-success mt-4"
        onClick={guardarHorarios}
      >
        Guardar Horarios
      </button>
    </div>
  )
}

export default Horarios 