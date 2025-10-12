import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../shared/Badge';
import { EyeIcon } from '@heroicons/react/24/outline';

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
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => navigate(`/socios/${socio.id}`)}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                    title="Ver detalle"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  {canModify && (
                    <>
                      <button
                        onClick={() => onEdit(socio.id)}
                        className="text-primary hover:text-primary-700 transition-colors duration-200 p-1 rounded hover:bg-primary-50"
                        title="Editar socio"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(socio.id)}
                        className="text-danger hover:text-danger-700 transition-colors duration-200 p-1 rounded hover:bg-danger-50"
                        title="Eliminar socio"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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

