import React, { useState, useEffect } from 'react';
import Input from '../shared/Input';
import Select from '../shared/Select';
import axios from '../../config/axios';

const PrestamoFormFields = ({ formData, onChange }) => {
  const [socios, setSocios] = useState([]);
  const [loadingSocios, setLoadingSocios] = useState(true);

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    try {
      const response = await axios.get('/socios');
      if (response.data.success) {
        setSocios(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar socios:', error);
    } finally {
      setLoadingSocios(false);
    }
  };

  const socioOptions = socios.map(socio => ({
    value: socio.id,
    label: `${socio.nombres} ${socio.apellidos} (${socio.cedula})`
  }));

  return (
    <div className="space-y-4">
      {/* Socio */}
      <div>
        <Select
          label="Socio *"
          name="socio_id"
          value={formData.socio_id}
          onChange={onChange}
          options={[
            { value: '', label: loadingSocios ? 'Cargando socios...' : 'Seleccionar socio' },
            ...socioOptions
          ]}
          required
          disabled={loadingSocios}
        />
      </div>

      {/* Capital y Plazo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Capital *"
          name="capital"
          type="number"
          value={formData.capital}
          onChange={onChange}
          placeholder="1000.00"
          min="100"
          max="50000"
          step="0.01"
          required
        />
        
        <Select
          label="Plazo *"
          name="plazo_meses"
          value={formData.plazo_meses}
          onChange={onChange}
          options={[
            { value: '', label: 'Seleccionar plazo' },
            { value: '3', label: '3 meses' },
            { value: '6', label: '6 meses' },
            { value: '9', label: '9 meses' },
            { value: '12', label: '12 meses' }
          ]}
          required
        />
      </div>

      {/* Fecha de inicio */}
      <div>
        <Input
          label="Fecha de Inicio *"
          name="fecha_inicio"
          type="date"
          value={formData.fecha_inicio}
          onChange={onChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
    </div>
  );
};

export default PrestamoFormFields;
