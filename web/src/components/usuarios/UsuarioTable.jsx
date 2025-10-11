import React from 'react';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

const UsuarioTable = ({ 
  usuarios, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  const getRoleBadgeVariant = (rol) => {
    switch (rol) {
      case 'ADMIN':
        return 'admin';
      case 'CAJERO':
        return 'cajero';
      case 'TESORERO':
        return 'tesorero';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Correo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {usuario.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {usuario.nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {usuario.correo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getRoleBadgeVariant(usuario.rol)}>
                  {usuario.rol}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={usuario.activo ? 'active' : 'inactive'}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(usuario.id)}
                  className="text-primary hover:text-primary-700 mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(usuario.id)}
                  className="text-danger hover:text-danger-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuarioTable;
