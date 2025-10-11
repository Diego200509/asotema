import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';

const PrestamoSearch = ({ 
  search, 
  onSearchChange, 
  estado, 
  onEstadoChange, 
  onNewPrestamo,
  canCreate = false 
}) => {
  const { user } = useAuth();

  return (
    <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar por socio, cédula o nombre..."
            value={search}
            onChange={onSearchChange}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={estado}
            onChange={onEstadoChange}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'PENDIENTE', label: 'Pendiente' },
              { value: 'CANCELADO', label: 'Cancelado' },
              { value: 'MORA', label: 'Mora' }
            ]}
          />
        </div>
      </div>
      
      {canCreate && (
        <Button
          variant="primary"
          onClick={onNewPrestamo}
          className="w-full sm:w-auto"
        >
          + Nuevo Préstamo
        </Button>
      )}
    </div>
  );
};

export default PrestamoSearch;
