import api from './config'

export const reservationService = {
  createReservation: (reservationData) => {
    console.log(reservationData)
    return api.post(`/api/reservaciones/mesa/${reservationData.idBar}`, reservationData)
  }
} 