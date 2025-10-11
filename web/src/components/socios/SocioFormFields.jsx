import React from 'react';
import Input from '../shared/Input';
import Select from '../shared/Select';

const SocioFormFields = ({ formData, onChange, isEdit = false }) => {
  return (
    <div className="space-y-4">
      {/* Primera fila: Cédula y Código (solo en edición) */}
      {isEdit ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cédula"
            name="cedula"
            value={formData.cedula}
            onChange={onChange}
            placeholder="0123456789"
            required
          />
          
          <Input
            label="Código"
            name="codigo"
            value={formData.codigo || ''}
            disabled
            placeholder="SOC-001"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Cédula"
            name="cedula"
            value={formData.cedula}
            onChange={onChange}
            placeholder="0123456789"
            required
          />
        </div>
      )}

      {/* Segunda fila: Nombres y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombres"
          name="nombres"
          value={formData.nombres}
          onChange={onChange}
          placeholder="Juan Carlos"
          required
        />
        
        <Input
          label="Apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={onChange}
          placeholder="Pérez García"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          onChange={onChange}
          placeholder="0987654321"
        />
        
        <Input
          label="Correo Electrónico"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={onChange}
          placeholder="socio@ejemplo.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de Ingreso"
          name="fecha_ingreso"
          type="date"
          value={formData.fecha_ingreso ? formData.fecha_ingreso.split('T')[0] : ''}
          onChange={onChange}
        />
        
        <Select
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={onChange}
          options={[
            { value: 'ACTIVO', label: 'Activo' },
            { value: 'INACTIVO', label: 'Inactivo' },
          ]}
          required
        />
      </div>
    </div>
  );
};

export default SocioFormFields;

