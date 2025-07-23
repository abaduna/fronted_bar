import React, { useState ,useEffect} from 'react';
import mesaService from '../api/mesaService';
import api from '../api/config';
import { Button } from '@mui/material';
const CrearMesa = () => {
  const [formData, setFormData] = useState({
    idZona: '',
    cantidadDePersonas: '',
    barId: '5',
  });
 const [zonas, setZonas] = useState([]);
  const [response, setResponse] = useState(null);
const [mesas, setMesas] = useState([]);
const [update,setUpdate] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 useEffect(() => {
    // Cargar zonas del bar al montar el componente
    const fetchZonas = async () => {
      try {
        const res = await api.get(`/zonas/ver/${formData.barId}`);
        setZonas(res.data);
      } catch (error) {
        console.error('Error al obtener las zonas:', error);
      }
    };

    fetchZonas();
  }, [formData.barId]); // Se vuelve a ejecutar si cambia el barId
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const mesaCreada = await mesaService.crearMesa({
        idZona: formData.idZona,
        cantidadDePersonas: parseInt(formData.cantidadDePersonas),
        barId: parseInt(formData.barId),
      });

      setResponse(mesaCreada);
      setUpdate(!update); 
    } catch (error) {
      console.error('Error al crear la mesa:', error);
    }
  };
useEffect(() => {
  const fetchMesas = async () => {
    try {
      const res = await api.get(`/api/mesas/bar/${formData.barId}`);
      setMesas(res.data);
    } catch (error) {
      console.error('Error al obtener las mesas:', error);
    }
  };

  fetchMesas();
}, [formData.barId,update]);
const handlerdeletd = async (mesa) => {
  try {
    await api.delete(`/api/mesas/${mesa.id}`);
    setMesas((prevMesas) => prevMesas.filter((m) => m
.id !== mesa.id));  
    console.log('Mesa eliminada:', mesa.id);
  } catch (error) {
    console.error('Error al eliminar la mesa:', error);
  }
};
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Crear nueva mesa</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* SELECT de zonas */}
        <select
          name="idZona"
          value={formData.idZona}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Selecciona una zona</option>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>
              {zona.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="cantidadDePersonas"
          value={formData.cantidadDePersonas}
          onChange={handleChange}
          placeholder="Cantidad de Personas"
          className="border p-2 w-full"
          required
        />
        
        <Button type="submit" variant="contained" color="primary" >
          Crear Mesa
        </Button>
      </form>

      {response && (
        <div className="mt-4 p-3 border bg-green-100 text-green-700">
          <strong>Mesa creada:</strong> ID {response.id}, Zona {response.idZona}
        </div>
      )}
      {mesas.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Mesas existentes</h3>
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {mesas.map((mesa) => (
        <div key={mesa.id} className="p-3 border rounded shadow-sm bg-gray-50"  >
        <li key={mesa.id} className="p-3 border rounded shadow-sm bg-gray-50">
          <p><strong>ID:</strong> {mesa.id}</p>
          <p><strong>Zona:</strong> {
  zonas.find(z => z.id === mesa.name)?.name || `Zona ID: ${mesa.name}`
}</p>

          <p><strong>Cantidad de personas</strong>{mesa.cantidadDePersonas}</p>
          <Button color='error' onClick={() => handlerdeletd(mesa)}>Eliminar mesa</Button>

        </li>
       
        </div>
      ))}
      
    </ul>
  </div>
)}

    </div>
  );
};

export default CrearMesa;
