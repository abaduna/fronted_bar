import api from '../api/config';

export const barService = {
  // Obtener mesas disponibles
  getAvailableTables: async (date, barId) => {
    return await api.get(`/api/mesas/disponibles/${barId}`, {
      params: { fecha: date }
    });
  },

  // Crear una reservación
  createReservation: async (tableId, reservationData) => {
    console.log(tableId);
    return await api.post(`/api/reservaciones/mesa/${tableId}`, {
      fecha: reservationData.fecha,
      hora: reservationData.hora
    });
  },

  // Mantener los métodos existentes
  createMesa: async (mesaData) => {
    return await api.post('/api/mesas/crear', mesaData);
  },

  createZona: async (barId, zonaData) => {
    
    return await api.post(`/zonas/crear/${barId}`, zonaData);
  }
}; 