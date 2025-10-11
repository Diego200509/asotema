import React from 'react';
import Button from '../shared/Button';

const UsuarioFormActions = ({ 
  isEdit = false,
  loading = false,
  onCancel 
}) => {
  return (
    <div className="flex gap-4 pt-6">
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        loading={loading}
        className="flex-1"
      >
        {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={loading}
        className="flex-1"
      >
        Cancelar
      </Button>
    </div>
  );
};

export default UsuarioFormActions;
