import React, { useState, useEffect } from 'react';
import Input from '../shared/Input';
import Select from '../shared/Select';
import SelectSocio from '../shared/SelectSocio';
import axios from '../../config/axios';

const PrestamoFormFields = ({ formData, onChange }) => {
  // Manejar cambio del SelectSocio
  const handleSocioChange = (selectedSocio) => {
    // El onChange del SelectSocio devuelve {id, cedula, nombreCompleto}
    // Necesitamos adaptarlo al formato esperado por el formulario
    const syntheticEvent = {
      target: {
        name: 'socio_id',
        value: selectedSocio ? selectedSocio.id : ''
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      {/* Socio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Socio *
        </label>
        <SelectSocio
          value={formData.selectedSocio}
          onChange={handleSocioChange}
          placeholder="Buscar por nombre o cédula..."
          className="w-full"
          required
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
          disabled={true}
          required
        />
        <p className="text-sm text-gray-600 mt-1">
          La fecha de inicio siempre será la fecha actual
        </p>
      </div>
    </div>
  );
};

export default PrestamoFormFields;
