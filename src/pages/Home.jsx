import { Link } from 'react-router-dom'
import { barService } from '../api/barService'
import { reservationService } from '../api/reservationService'
import { useState, useEffect } from 'react'
import '../Css/home.css'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
const DEFAULT_BAR_IMAGE = "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80"
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
function Home() {
    const [bars, setBars] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedBar, setSelectedBar] = useState(null)
    const [reservation, setReservation] = useState({
        date: '',
        time: '',
        guests: 1,
        name: '',
        email: '',
        phone: ''
    })
    const [showAlert, setShowAlert] = useState(false)
    const [availableTimeSlots, setAvailableTimeSlots] = useState([])
    const [errorAlert, setErrorAlert] = useState({ show: false, message: '' })
    const [showDateAlert, setShowDateAlert] = useState(false)
    const [selectedZone, setSelectedZone] = useState('')
    const [showZoneSelection, setShowZoneSelection] = useState(false)
    const [zonas, setZonas] = useState([])
    const [id, setId] = useState(null)
    initMercadoPago("TEST-7d3c069e-c9b4-42a1-b863-ad5c5784886c",{locale:"es-AR"});
    console.log(reservation)
    useEffect(() => {
        const getBares = async () => {
            try {
                const response = await barService.getAllBars('/bars/todos')
                setBars(response.data)
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching bars:', error)
                setBars([]) // Set empty array in case of error
            }
        }
        getBares()
    }, [])

    const fetchZonas = async (barId) => {
        try {
            const response = await barService.getZonas(barId)
            setZonas(response.data)
        } catch (error) {
            console.error('Error fetching zones:', error)
            setZonas([])
        }
    }

    const handleReservationClick = (bar) => {
        setSelectedBar(bar)
        setShowModal(true)
        
    }

    const fetchAvailableSchedule = async (date) => {
        try {
            const response = await barService.getAvailableSchedule(selectedBar.id, date)
            const slots = response.data.flatMap(schedule => {
                const timeSlots = []
                const start = schedule.startTime
                const end = schedule.endTime
                
                let currentTime = start
                while (currentTime < end) {
                    timeSlots.push(currentTime)
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
            setAvailableTimeSlots(slots)
        } catch (error) {
            console.error('Error fetching schedule:', error)
            setAvailableTimeSlots([])
        }
    }

    useEffect(() => {
        if (reservation.date && selectedBar) {
            fetchAvailableSchedule(reservation.date)
        }
    }, [reservation.date, selectedBar])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const fechaHora = `${reservation.date}T${reservation.time}:00`
            const precioFinal = 1000;
            
            const response = await reservationService.createReservation({
                idBar: selectedBar?.id,
                fecha: fechaHora,
                cantidaDePersonas: parseInt(reservation.guests),
                nombre: reservation.name,
                mail: reservation.email,
                phone: reservation.phone,
                nameZona: selectedZone || null,
                precioFinal: precioFinal
            });

            console.log("API Response:", response);
            
            if (response.data) {
                setId(response.data);
            } else {
                console.error('No se recibió el ID de MercadoPago');
                setErrorAlert({ 
                    show: true, 
                    message: 'Error al generar el pago' 
                });
            }
            
        } catch (error) {
            console.error('Error completo:', error);
            setErrorAlert({ 
                show: true, 
                message: error.response?.data?.message || 'Error al crear la reservación'
            });
        }
    }

    const handleZoneButtonClick = async () => {
      console.log("handleZoneButtonClick")
        setShowZoneSelection(!showZoneSelection);
        if (!showZoneSelection && selectedBar) {  // Only fetch if we're opening the selection and have a bar
            await fetchZonas(selectedBar.id);
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
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 1
            }}></div>
            
            <div className="container py-5" style={{ position: 'relative', zIndex: 2 }}>
               
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {bars.length > 0 && bars.map((bar) => (
                        <div key={bar.id} className="col">
                            <div className="card h-100 bg-dark bg-opacity-75 text-white border-0">
                                <div className="position-relative" style={{ height: '200px' }}>
                                    {/* Imagen de fondo por defecto */}
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundImage: `url(${DEFAULT_BAR_IMAGE})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: 'blur(2px)',
                                            opacity: 0.7
                                        }}
                                    />
                                    {/* Imagen circular del bar */}
                                    <div 
                                        className="d-flex justify-content-center align-items-center"
                                        style={{ height: '100%', position: 'relative' }}
                                    >
                                        <img 
                                            src={bar.imagen || DEFAULT_BAR_IMAGE} 
                                            className="rounded-circle"
                                            alt={bar.name}
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'cover',
                                                border: '3px solid white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DEFAULT_BAR_IMAGE;
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h2 className="card-title h4 text-center fw-bold text-white">{bar.name}</h2>
                                    <p className="card-text text-light">{bar.description}</p>
                                    <p className="card-text text-light">
                                        <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                        {bar.location}
                                    </p>
                                    <p className="card-text text-light">
                                        <i className="bi bi-telephone-fill text-success me-2"></i>
                                        {bar.phone}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <Link 
                                            to={`/bar/${bar.id}`} 
                                            className="btn"
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
                                            <i className="bi bi-info-circle me-2"></i>Ver detalles
                                        </Link>
                                        <button 
                                            className="btn" 
                                            onClick={() => handleReservationClick(bar)}
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
                                            <i className="bi bi-calendar-check me-2"></i>Reservar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bootstrap Modal */}
                <div className={`modal fade ${showModal ? 'show' : ''}`} 
                    style={{ display: showModal ? 'block' : 'none' }}
                    tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-white">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title">Reserva para {selectedBar?.name}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            <i className="bi bi-calendar-heart me-2"></i>Fecha
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={reservation.date}
                                            onChange={(e) => setReservation({...reservation, date: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Hora</label>
                                        <select
                                            className="form-control bg-dark text-white border-secondary"
                                            value={reservation.time}
                                            onChange={(e) => {
                                                if (!reservation.date) {
                                                    setShowDateAlert(true)
                                                    setTimeout(() => setShowDateAlert(false), 3000)
                                                    return
                                                }
                                                setReservation({...reservation, time: e.target.value})
                                            }}
                                            required
                                        >
                                            <option value="">Selecciona la hora</option>
                                            {availableTimeSlots.map((timeSlot, index) => (
                                                <option key={index} value={timeSlot}>
                                                    {timeSlot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
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
                                    <div className="mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={reservation.name}
                                            onChange={(e) => setReservation({...reservation, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                           
                                            className="form-control"
                                            value={reservation.email}
                                            onChange={(e) => setReservation({...reservation, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
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
                                                transition: 'all 0.3s ease'
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
                                    <div className="mb-3">
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
                                            Preferencia de zona (opcional)
                                        </button>}
                                      
                                        
                                        {showZoneSelection && (
                                            <div className="mt-3">
                                                <label className="form-label">Selecciona una zona</label>
                                                <select
                                                    className="form-control bg-dark text-white border-secondary"
                                                    value={selectedZone}
                                                    onChange={(e) => setSelectedZone(e.target.value)}
                                                >
                                                    <option value="">Elige una zona</option>
                                                    {zonas.map((zona) => (
                                                        <option key={zona.id} value={zona.id}>
                                                            {zona.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn" 
                                            onClick={() => {setShowModal(false),setShowZoneSelection(false)}}
                                            style={{
                                                backgroundColor: '#8B5CF6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px'
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px'
                                            }}
                                        >
                                            Pagar con Mercado Pago
                                        </button>
                                        {id&&<Wallet initialization={{ preferenceId: `${id}` }} customization={{ texts:{ valueProp: 'smart_option'}}} />}
                                        {showAlert && (
                <div className="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert">
                    Reserva creada exitosamente
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
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Backdrop */}
                {showModal && <div className="modal-backdrop fade show"></div>}
            </div>
        </div>
    )
}

export default Home 