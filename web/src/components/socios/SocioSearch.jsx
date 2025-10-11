import React from 'react';
import Input from '../shared/Input';
import Button from '../shared/Button';

const SocioSearch = ({ search, onSearchChange, onNewSocio, canCreate }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex-1 w-full sm:w-auto">
        <Input
          type="text"
          placeholder="Buscar por nombre, apellido, cédula o correo..."
          value={search}
          onChange={onSearchChange}
        />
      </div>
      {canCreate && (
        <Button
          variant="primary"
          onClick={onNewSocio}
          className="w-full sm:w-auto"
        >
          + Nuevo Socio
        </Button>
      )}
    </div>
  );
};

export default SocioSearch;

