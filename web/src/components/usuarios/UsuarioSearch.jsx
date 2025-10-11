import React from 'react';
import Input from '../shared/Input';
import Button from '../shared/Button';

const UsuarioSearch = ({ 
  search, 
  onSearchChange, 
  onNewUsuario 
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex-1 w-full sm:w-auto">
        <Input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={onSearchChange}
        />
      </div>
      <Button
        variant="primary"
        onClick={onNewUsuario}
        className="w-full sm:w-auto"
      >
        + Nuevo Usuario
      </Button>
    </div>
  );
};

export default UsuarioSearch;
