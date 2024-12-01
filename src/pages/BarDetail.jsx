import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { barService } from '../api/barService'
import { reservationService } from '../api/reservationService'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function BarDetail() {
  const { id } = useParams()
  const [availableTables, setAvailableTables] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [reservation, setReservation] = useState({
    date: '',
    time: '',
    guests: 1,
    name: '',
    email: '',
    phone: ''
  })
  const [showAlert, setShowAlert] = useState(false)
  const [errorAlert, setErrorAlert] = useState({ show: false, message: '' })
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [showZoneSelection, setShowZoneSelection] = useState(false)
  const [zonas, setZonas] = useState([])
  const [selectedZone, setSelectedZone] = useState('')
  useEffect(() => {
    if (selectedDate) {
      console.log(selectedDate)
      fetchAvailableSchedule(selectedDate)
    }
  }, [selectedDate])
  const handleZoneButtonClick = async () => {
    console.log("handleZoneButtonClick")
      setShowZoneSelection(!showZoneSelection);
      if (!showZoneSelection && id) {  // Only fetch if we're opening the selection and have a bar
          await fetchZonas(id);
      }
  }
  const fetchZonas = async (barId) => {
    try {
        const response = await barService.getZonas(id)
        setZonas(response.data)
    } catch (error) {
        console.error('Error fetching zones:', error)
        setZonas([])
    }
}

  const fetchAvailableTables = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        alert('Por favor seleccione fecha y hora')
        return
      }

      const formattedDateTime = `${selectedDate}T${selectedTime}`
      const response = await barService.getAvailableTables(formattedDateTime, id)
      setAvailableTables(response.data)
    } catch (error) {
      console.error('Error fetching available tables:', error)
    }
  }

  const fetchAvailableSchedule = async (time) => {
    try {
      const response = await barService.getAvailableSchedule(id, time)
      console.log(response.data)
      const slots = response.data.flatMap(schedule => {
        const timeSlots = []
        const start = schedule.startTime
        const end = schedule.endTime
        
        let currentTime = start
        while (currentTime < end) {
          timeSlots.push(currentTime)
          // Calculate next hour
          const [hours, minutes] = currentTime.split(':')
          const date = new Date(2000, 0, 1, hours, minutes)
          date.setHours(date.getHours() + 1)
          currentTime = date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        }
        return timeSlots
      })
      console.log(slots)
      setAvailableTimeSlots(slots)
    } catch (error) {
      console.error('Error fetching schedule:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación del teléfono (al menos 9 dígitos sin contar código de país)
    const phoneDigits = reservation.phone.replace(/\D/g, '').slice(2); // Elimina el código de país
    if (phoneDigits.length < 9) {
      setErrorAlert({ 
        show: true, 
        message: 'El número de teléfono debe tener al menos 9 dígitos' 
      });
      setTimeout(() => {
        setErrorAlert({ show: false, message: '' });
      }, 3000);
      return;
    }

    try {
      const fechaHora = `${reservation.date}T${reservation.time}:00`
      
      const reservationData = {
        idBar: id,
        fecha: fechaHora,
        cantidaDePersonas: parseInt(reservation.guests),
        nombre: reservation.name,
        mail: reservation.email,
        phone: reservation.phone,
        nameZona: selectedZone || null
      }

      const response = await reservationService.createReservation(reservationData)
      
      if (response.status === 201) {
        setShowAlert(true)
        setTimeout(() => {
          setShowAlert(false)
        }, 3000)
        
        setReservation({
          date: '',
          time: '',
          guests: 1,
          name: '',
          email: '',
          phone: ''
        })
      }
    } catch (error) {
      setErrorAlert({ 
        show: true, 
        message: error.response.data.message 
      })
      setTimeout(() => {
        setErrorAlert({ show: false, message: '' })
      }, 3000)
    }
  }

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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1
      }}></div>
      
      <div className="container py-5" style={{ position: 'relative', zIndex: 2 }}>
        <h1 className="text-center mb-4">Detalles del Bar</h1>

        {/* Formulario de reserva */}
        <div className="card shadow-sm hover-shadow transition mb-4">
          <div className="card-body">
            <h5 className="card-title h4 text-center fw-bold text-dark mb-4">Hacer una reserva</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setReservation({...reservation, date: e.target.value});
                    }}
                    required
                    style={{
                      cursor: 'pointer',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.border = '2px solid #EC4899'}
                    onBlur={(e) => e.target.style.border = '2px solid #e2e8f0'}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Hora</label>
                  <select
                    className="form-control"
                    value={reservation.time}
                    onChange={(e) => setReservation({...reservation, time: e.target.value})}
                    required
                  >
                    <option value="">Seleccione una hora</option>
                    {availableTimeSlots.map((timeSlot, index) => (
                      <option key={index} value={timeSlot}>{timeSlot}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Número de personas</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={reservation.guests}
                    onChange={(e) => setReservation({...reservation, guests: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={reservation.name}
                    onChange={(e) => setReservation({...reservation, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={reservation.email}
                    onChange={(e) => setReservation({...reservation, email: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <PhoneInput
                    country={'arg'}
                    value={reservation.phone}
                    onChange={(phone) => setReservation({...reservation, phone: phone})}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      ':focus': {
                        border: '2px solid #EC4899'
                      }
                    }}
                    containerStyle={{
                      border: 'none'
                    }}
                    buttonStyle={{
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px 0 0 8px',
                      backgroundColor: 'white'
                    }}
                    inputProps={{
                      className: 'form-control'
                    }}
                    isValid={(value, country) => {
                      return value.length >= 11;
                    }}
                    required
                  />
                </div>
                {!showZoneSelection &&  <button
                                            type="button"
                                            className="btn w-100"
                                            onClick={handleZoneButtonClick}
                                            style={{
                                                background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px'
                                            }}
                                        >
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Preferencia de zona
                                        </button>}
                                      
                                        
                                        {showZoneSelection && (
                                            <div className="col-12">
                                                <label className="form-label">Selecciona una zona</label>
                                                <select
                                                    className="form-control"
                                                    value={selectedZone}
                                                    onChange={(e) => setSelectedZone(e.target.value)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onFocus={(e) => e.target.style.border = '2px solid #EC4899'}
                                                    onBlur={(e) => e.target.style.border = '2px solid #e2e8f0'}
                                                >
                                                    <option value="">Elige una zona</option>
                                                    {zonas.map((zona) => (
                                                        <option key={zona.id} value={zona.name}>
                                                            {zona.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                <div className="col-12">
                  <button 
                    type="submit" 
                    className="btn w-100"
                    style={{
                      background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 20px'
                    }}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Confirmar Reserva
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Alerts */}
        {showAlert && (
          <div className="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert">
            Reserva creada exitosamente
            <button type="button" className="btn-close" onClick={() => setShowAlert(false)} aria-label="Close"></button>
          </div>
        )}
        {errorAlert.show && (
          <div 
            className="alert fade show position-fixed top-0 start-50 translate-middle-x mt-3" 
            role="alert"
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
              color: 'white',
              borderRadius: '8px',
              padding: '1rem 2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 9999
            }}
          >
            <i className="bi bi-exclamation-circle me-2"></i>
            {errorAlert.message}
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setErrorAlert({ show: false, message: '' })} 
              aria-label="Close"
            ></button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BarDetail 