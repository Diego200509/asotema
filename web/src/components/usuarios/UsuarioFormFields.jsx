import React from 'react';
import Input from '../shared/Input';
import PasswordInput from '../shared/PasswordInput';
import Select from '../shared/Select';
import Switch from '../shared/Switch';

const UsuarioFormFields = ({ 
  formData, 
  onChange, 
  isEdit = false 
}) => {
  const roleOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'CAJERO', label: 'Cajero' },
    { value: 'TESORERO', label: 'Tesorero' }
  ];

  return (
    <div className="space-y-6">
      {/* Nombre */}
      <Input
        label="Nombre Completo"
        name="nombre"
        value={formData.nombre}
        onChange={onChange}
        placeholder="Ej: Juan Pérez"
        required
      />

      {/* Correo */}
      <Input
        label="Correo Electrónico"
        name="correo"
        type="email"
        value={formData.correo}
        onChange={onChange}
        placeholder="usuario@asotema.com"
        required
      />

      {/* Contraseña */}
      <PasswordInput
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={onChange}
        placeholder="Mínimo 6 caracteres"
        required={!isEdit}
        minLength={6}
      />
      {isEdit && (
        <p className="text-xs text-gray-500 mt-1">
          Dejar en blanco para mantener la actual
        </p>
      )}

      {/* Rol */}
      <Select
        label="Rol"
        name="rol"
        value={formData.rol}
        onChange={onChange}
        options={roleOptions}
        required
      />

      {/* Estado Activo */}
      <Switch
        label="Usuario Activo"
        name="activo"
        checked={formData.activo}
        onChange={onChange}
      />
    </div>
  );
};

export default UsuarioFormFields;
