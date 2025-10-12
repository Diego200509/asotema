import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';

const SelectSocioSimple = ({ value, onChange, placeholder = "Buscar socio..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar socios cuando se abre
  useEffect(() => {
    if (isOpen && socios.length === 0) {
      loadSocios('');
    }
  }, [isOpen, socios.length]);

  const loadSocios = async (search = '') => {
    setLoading(true);
    try {
      console.log('Cargando socios con búsqueda:', search);
      const response = await axios.get('/socios', {
        params: {
          per_page: 10,
          page: 1,
          q: search
        }
      });
      
      console.log('Respuesta de socios:', response.data);
      console.log('Datos extraídos:', response.data.data?.data || []);
      setSocios(response.data.data?.data || []);
    } catch (error) {
      console.error('Error al cargar socios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Debounce simple
    setTimeout(() => {
      if (term !== searchTerm) return; // Evitar búsquedas obsoletas
      loadSocios(term);
    }, 300);
  };

  const handleSelect = (socio) => {
    onChange({
      id: socio.id,
      cedula: socio.cedula,
      nombreCompleto: `${socio.nombres} ${socio.apellidos} — (${socio.cedula})`
    });
    setSearchTerm(`${socio.nombres} ${socio.apellidos} — (${socio.cedula})`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-center">
              <p>Cargando socios...</p>
            </div>
          ) : socios.length > 0 ? (
            socios.map((socio) => (
              <div
                key={socio.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(socio)}
              >
                {socio.nombres} {socio.apellidos} — ({socio.cedula})
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-center text-gray-500">
              No se encontraron socios
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectSocioSimple;
