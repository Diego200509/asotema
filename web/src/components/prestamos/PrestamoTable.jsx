import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../shared/Badge';
import { EyeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatDateForEcuador } from '../../utils/dateUtils';

const PrestamoTable = ({ prestamos, loading, onView, canModify }) => {
  const navigate = useNavigate();

  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'CANCELADO': return 'success';
      case 'MORA': return 'danger';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">Cargando préstamos...</p>
      </div>
    );
  }

  if (prestamos.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">No se encontraron préstamos.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Socio
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capital
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plazo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Inicio
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prestamos.map((prestamo) => (
            <tr key={prestamo.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{prestamo.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>
                  <div className="font-medium text-gray-900">
                    {prestamo.socio?.nombres} {prestamo.socio?.apellidos}
                  </div>
                  <div className="text-xs text-gray-500">
                    C.I. {prestamo.socio?.cedula}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(prestamo.capital)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prestamo.plazo_meses} meses
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateForEcuador(prestamo.fecha_inicio, 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Badge variant={getEstadoBadgeVariant(prestamo.estado)}>
                  {prestamo.estado}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(prestamo.id)}
                    className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="Ver detalle"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  {canModify && prestamo.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => navigate(`/prestamos/${prestamo.id}/pagar`)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      title="Pagar cuota"
                    >
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </button>
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

export default PrestamoTable;
