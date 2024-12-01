import api from './config'

export const barService = {
  // Obtener todos los bares
  getAllBars: (endpoint) => {
    return api.get(endpoint)
  },

  // Get available tables
  getAvailableTables: (date, barId) => {
    return api.get(`/api/mesas/disponibles/${date}/${barId}`)
  },

  // Crear un nuevo bar
  createBar: (endpoint) => {
    return api.post(endpoint)
  },

  // Actualizar un bar
  updateBar: (id, barData) => {
    return api.put(`/bars/${id}`, barData)
  },

  // Eliminar un bar
  deleteBar: (endpoint) => {
    return api.delete(endpoint)
  },

  createReservation: (mesaId, reservationData) => {
    console.log(mesaId);
    return api.post(`/api/reservaciones/mesa/${mesaId}`, reservationData)
  },

  createZona: async (idBar, zonaData) => {
    return await api.post(`/zonas/crear/${idBar}`, {
      idBar: Number(idBar),
      name: zonaData.name
    });
  },

  createMesa: async (mesaData) => {
    return await api.post('/api/mesas/crear', {
      idZona: mesaData.idZona,
      idBar: mesaData.idBar,
      maximo: parseInt(mesaData.maximo)
    });
  },

  getAvailableSchedule: async (barId, date) => {
    console.log(barId, date)
    return await api.get(`/api/schedule/bars/${barId}/available?date=${date}`)
  },
  getZonas: async (barId) => {
    console.log(barId)
    return await api.get(`/zonas/ver/${barId}`)
  }
}