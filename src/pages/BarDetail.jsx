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
  const [barInfo, setBarInfo] = useState(null)

const formatGpsUrl = (coords) => {
  if (!coords) return '';
  return `https://www.google.com/maps?q=${coords}&output=embed`;
};

  useEffect(() => {
    const fetchBarInfo = async () => {
      try {
        const response = await barService.getBarById(id)
        console.log(response.data)
        setBarInfo(response.data)
      } catch (error) {
        console.error('Error fetching bar info:', error)
        setErrorAlert({
          show: true,
          message: 'Error al cargar la información del bar'
        })
      }
    }

    if (id) {
      fetchBarInfo()
    }
  }, [id])

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
      if (error.response?.data?.message) {
        setErrorAlert({
          show: true,
          message: error.response.data.message
        })
        setTimeout(() => {
          setErrorAlert({ show: false, message: '' })
        }, 3000)
      }
      setAvailableTimeSlots([])
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
        nameZona: selectedZone || null,
        precioFinal: 100
      }
     
      const response = await reservationService.createReservation(reservationData)
      
      if (response?.data) {
        try {
          

            // Check if we have a successful response (status 200)
          if (response && typeof response.data === 'string') {
  const redirectUrl = response.data;
  console.log("Redirigiendo a:", redirectUrl);
  window.location.href = redirectUrl;
}

        } catch (mpError) {
            console.error('Error creating payment:', mpError);
            setErrorAlert({ 
                show: true, 
                message: 'Error al procesar el pago. Por favor, intente nuevamente.'
            });
        }
    }else{
      throw new Error("Respuesta inesperada del servidor");
    }
    } catch (error) {
  console.error(error);
  const errorMessage =
    error?.response?.data?.message || 'Ocurrió un error inesperado. Por favor, intente nuevamente.';

  setErrorAlert({ 
    show: true, 
    message: errorMessage 
  });

  setTimeout(() => {
    setErrorAlert({ show: false, message: '' });
  }, 3000);
}

  }

  return (
    <div className="container-fluid min-vh-100 p-0">
      {/* Banner Section */}
     {barInfo?.banerUrl && ( <div 
      className="position-relative"
  style={{
    height: '300px',
    backgroundImage: `url("http://localhost:8081${barInfo?.banerUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    marginBottom: '60px',
  
  }}

      >
        <div 
          className="position-absolute w-100 h-100" 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        />
        <div 
          className="position-absolute"
          style={{
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <img 
            src={`http://localhost:8081${barInfo?.imagen}`} 
            alt={barInfo?.name}
            className="rounded-circle border border-4 border-white"
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'cover',
              backgroundColor: 'white'
            }}
          />
        </div>
      </div>)}

      {/* Info Section */}
      {barInfo && (
        <div className="container">
          <div className="row g-4">
            {/* Bar Information - changed to half width */}
            <div className="col-md-6">
              <div className="card bg-transparent border-0">
                <div className="card-body">
                  <h2 className="card-title h3 mb-4 text-black text-center">{barInfo.name}</h2>
                  <div className="text-black mb-4">
                    <p className="mb-3">
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      <strong>Ubicación:</strong> {barInfo.location}
                    </p>
                    <p className="mb-3 d-flex align-items-center">
                      <i className="bi bi-telephone-fill me-2"></i>
                      <strong>Teléfono:</strong> {barInfo.phone}
                      <a
                        href={`https://wa.me/${barInfo.phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm ms-2"
                        style={{
                          backgroundColor: '#25D366',
                          color: 'white'
                        }}
                      >
                        <i className="bi bi-whatsapp me-1"></i>
                        WhatsApp
                      </a>
                    </p>
                  </div>
                  <div className="text-black">
                    <h5 className="h6 mb-2">Descripción</h5>
                    <p className="opacity-75">{barInfo.descripcionLarga}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Google Maps iframe - new column */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body p-0">
                 <iframe
  src={formatGpsUrl(barInfo?.localizacionGps)}
  width="100%"
  height="100%"
  style={{ border: 0, minHeight: "300px" }}
  allowFullScreen=""
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de reserva */}
      <div className="card shadow-sm hover-shadow transition mb-4" style={{ backgroundColor: '#f8f9fa' }}>
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
              {/* Zone selection button and dropdown */}
              <div className="col-12">
                {!showZoneSelection && (
                  <button
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
                  </button>
                )}
                
                {showZoneSelection && (
                  <>
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
                  </>
                )}
              </div>
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
  )
}

export default BarDetail 