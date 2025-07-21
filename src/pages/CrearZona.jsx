// src/components/CrearZona.jsx
import React, { useState } from 'react';
import { crearZona } from '../api/zonaService';

const CrearZona = () => {
  const [nombreZona, setNombreZona] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [idBar, setIdBar] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const zonaBar = { "name":nombreZona };
      const zonaCreada = await crearZona(idBar, zonaBar);
      setMensaje(`Zona creada con ID: ${zonaCreada.id}`);
    } catch (error) {
      console.error(error);
      setMensaje('Error al crear la zona');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Zona</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>ID del Bar:</label>
          <input
            type="text"
            value={idBar}
            onChange={(e) => setIdBar(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label>Nombre de la Zona:</label>
          <input
            type="text"
            value={nombreZona}
            onChange={(e) => setNombreZona(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Crear</button>
      </form>

      {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
    </div>
  );
};

export default CrearZona;
