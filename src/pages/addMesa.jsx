import React, { useState ,useEffect} from 'react';
import mesaService from '../api/mesaService';
import api from '../api/config';
const CrearMesa = () => {
  const [formData, setFormData] = useState({
    idZona: '',
    cantidadDePersonas: '',
    barId: '5',
  });
 const [zonas, setZonas] = useState([]);
  const [response, setResponse] = useState(null);

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
    } catch (error) {
      console.error('Error al crear la mesa:', error);
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
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Crear Mesa
        </button>
      </form>

      {response && (
        <div className="mt-4 p-3 border bg-green-100 text-green-700">
          <strong>Mesa creada:</strong> ID {response.id}, Zona {response.idZona}
        </div>
      )}
    </div>
  );
};

export default CrearMesa;
