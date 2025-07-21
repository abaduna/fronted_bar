// src/services/zonaService.js
import api from './config';

export const crearZona = async (idBar, zona) => {
  const response = await api.post(`/zonas/crear/${idBar}`, zona);
  return response.data;
};
