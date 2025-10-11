import React from 'react';
import Input from '../shared/Input';
import PasswordInput from '../shared/PasswordInput';
import Select from '../shared/Select';
import Switch from '../shared/Switch';

const UsuarioFormFields = ({ 
  formData, 
  onChange, 
  isEdit = false,
  currentUser 
}) => {
  const roleOptions = [
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
        placeholder={isEdit ? "Dejar en blanco para mantener la actual" : "Mínimo 6 caracteres"}
        required={!isEdit}
        minLength={6}
      />

      {/* Rol - Solo mostrar si no es ADMIN o si es creación */}
      {!(isEdit && currentUser?.rol === 'ADMIN' && formData.rol === 'ADMIN') && (
        <Select
          label="Rol"
          name="rol"
          value={formData.rol}
          onChange={onChange}
          options={roleOptions}
          required
        />
      )}

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
