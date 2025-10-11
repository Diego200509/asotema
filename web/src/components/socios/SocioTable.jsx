import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../shared/Badge';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const SocioTable = ({ socios, loading, onEdit, onDelete, canModify }) => {
  const navigate = useNavigate();
  const getEstadoBadgeVariant = (estado) => {
    return estado === 'ACTIVO' ? 'success' : 'danger';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">Cargando socios...</p>
      </div>
    );
  }

  if (socios.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">No se encontraron socios</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cédula
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombres
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apellidos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Correo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {socios.map((socio) => (
            <tr key={socio.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {socio.codigo || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {socio.cedula}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {socio.nombres}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {socio.apellidos}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {socio.telefono || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {socio.correo || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getEstadoBadgeVariant(socio.estado)}>
                  {socio.estado}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/socios/${socio.id}`)}
                    className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="Ver detalle"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  {canModify && (
                    <>
                      <button
                        onClick={() => onEdit(socio.id)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(socio.id)}
                        className="text-danger-600 hover:text-danger-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SocioTable;

