import { Link } from 'react-router-dom'
import { barService } from '../api/barService'
import { reservationService } from '../api/reservationService'
import { useState, useEffect } from 'react'
import '../Css/home.css'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const DEFAULT_BAR_IMAGE = "/eeb.webp"
const DEFAULT_BAR_IMAGE_2 = "barfondo.webp"

function Home() {
    const [bars, setBars] = useState([])
    const [loading, setLoading] = useState(false)
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
    const [errorAlert, setErrorAlert] = useState({ show: false, message: '' })
    const [availableTimeSlots, setAvailableTimeSlots] = useState([])
    const [showZoneSelection, setShowZoneSelection] = useState(false)
    const [selectedZone, setSelectedZone] = useState('')
    const [zonas, setZonas] = useState([])

    useEffect(() => {
        const getBares = async () => {
            setLoading(true)
            try {
                const response = await barService.getAllBars('/bars/todos')
                setBars(response.data)
            } catch (error) {
                console.error('Error fetching bars:', error)
                setBars([])
            } finally {
                setLoading(false)
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
            if (error.response?.status === 400) {
                setErrorAlert({
                    show: true,
                    message: error.response.data.message || 'No hay horarios disponibles para la fecha seleccionada'
                })
                setTimeout(() => {
                    setErrorAlert({ show: false, message: '' })
                }, 3000)
            }
        }
    }

    useEffect(() => {
        if (reservation.date && selectedBar) {
            fetchAvailableSchedule(reservation.date)
        }
    }, [reservation.date, selectedBar])

    const handleReservationClick = (bar) => {
        setSelectedBar(bar)
        setShowModal(true)
    }

    const handleZoneButtonClick = async () => {
        setShowZoneSelection(!showZoneSelection)
        if (!showZoneSelection && selectedBar) {
            await fetchZonas(selectedBar.id)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const phoneDigits = reservation.phone.replace(/\D/g, '').slice(2)
        if (phoneDigits.length < 9) {
            setErrorAlert({
                show: true,
                message: 'El número de teléfono debe tener al menos 9 dígitos'
            })
            setTimeout(() => setErrorAlert({ show: false, message: '' }), 3000)
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(reservation.email)) {
            setErrorAlert({
                show: true,
                message: 'Por favor, ingrese un correo electrónico válido'
            })
            setTimeout(() => setErrorAlert({ show: false, message: '' }), 3000)
            return
        }

        const selectedZoneName = zonas.find(zona => zona.id === selectedZone)?.name || ''
        const fechaHora = `${reservation.date}T${reservation.time}:00`

        try {
            const reservationResponse = await reservationService.createReservation({
                idBar: selectedBar?.id,
                fecha: fechaHora,
                cantidaDePersonas: parseInt(reservation.guests),
                nombre: reservation.name,
                mail: reservation.email,
                phone: reservation.phone,
                nameZona: selectedZoneName,
                precioFinal: 100
            })

            if (reservationResponse?.status === 200) {
                const redirectUrl = reservationResponse.data
                window.location.href = redirectUrl
            }
        } catch (error) {
            console.error('Error details:', error)
            setErrorAlert({
                show: true,
                message: error.response?.data?.message || 'Error al crear la reserva'
            })
            setTimeout(() => setErrorAlert({ show: false, message: '' }), 3000)
        }
    }

    return (
        <div
            className="container-fluid min-vh-100"
            style={{
                backgroundImage: `url(${DEFAULT_BAR_IMAGE_2})`,
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
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center w-100 my-5">
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : bars.length > 0 ? (
                        bars.map((bar) => (
                            <div key={bar.id} className="col">
                                <div className="card h-100 bg-dark bg-opacity-75 text-white border-0">
                                    <div className="position-relative" style={{ height: '200px' }}>
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
                                                    e.target.onerror = null
                                                    e.target.src = DEFAULT_BAR_IMAGE
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
                        ))
                    ) : (
                        <div className="text-center text-white w-100 my-5">No hay bares disponibles</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home
