import React from 'react';
import Button from '../shared/Button';

const SocioSearch = ({ search, onSearchChange, onNewSocio, canCreate }) => {
  return (
    <div className="mb-6 flex justify-between items-center gap-4">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, cédula o correo..."
          value={search}
          onChange={onSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      {canCreate && (
        <Button
          onClick={onNewSocio}
          variant="primary"
          style={{
            backgroundColor: '#16A34A',
            color: '#ffffff',
            padding: '0.5rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#15803d';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#16A34A';
          }}
        >
          Nuevo Socio
        </Button>
      )}
    </div>
  );
};

export default SocioSearch;

