import api from './config';

const crearMesa = async (mesaData) => {
  const response = await api.post("/api/mesas", mesaData);
  return response.data;
};

export default {
  crearMesa,
};
