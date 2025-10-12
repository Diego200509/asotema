import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ahorrosAPI } from '../../services/api/ahorros';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import ConfirmModal from '../shared/ConfirmModal';
import Pagination from '../shared/Pagination';
import { TrashIcon } from '@heroicons/react/24/outline';
import { formatDateForEcuador } from '../../utils/dateUtils';

const AhorrosTable = ({ 
  aportes, 
  loading, 
  onRefresh,
  showSocio = false,
  allowDelete = true,
  pagination = null,
  onPageChange = null
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canModify = allowDelete && (user?.rol === 'ADMIN' || user?.rol === 'TESORERO');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDateForEcuador(dateString, 0);
  };

  const formatMonth = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // El mes viene como fecha YYYY-MM-DD desde el backend con zona horaria correcta
      const date = new Date(dateString + 'T00:00:00-05:00'); // Forzar zona horaria Ecuador
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${year}`;
      
    } catch (error) {
      return 'N/A';
    }
  };

  const handleDelete = async (aporte) => {
    setDeleteConfirm({
      title: 'Eliminar Aporte',
      message: `¿Estás seguro de que deseas eliminar este ${aporte.tipo.toLowerCase()} de ${formatCurrency(aporte.monto)}?`,
      onConfirm: async () => {
        try {
          const response = await ahorrosAPI.eliminarAporte(aporte.id);
          if (response.success) {
            showSuccess('Aporte eliminado exitosamente');
            onRefresh && onRefresh();
          }
        } catch (error) {
          console.error('Error al eliminar aporte:', error);
          showError(error.response?.data?.message || 'Error al eliminar el aporte');
        } finally {
          setDeleteConfirm(null);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!aportes || aportes.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay aportes registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza registrando el primer aporte de ahorro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar" style={{ minHeight: '300px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {showSocio && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Operación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado por
                </th>
                {canModify && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aportes.map((aporte) => (
                <tr key={aporte.id} className="hover:bg-gray-50">
                  {showSocio && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {aporte.socio?.nombres} {aporte.socio?.apellidos}
                        </div>
                        <div className="text-gray-500">{aporte.socio?.cedula}</div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMonth(aporte.mes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(aporte.fecha_operacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={aporte.tipo === 'DEPOSITO' ? 'success' : 'destructive'}
                      size="sm"
                    >
                      {aporte.tipo === 'DEPOSITO' ? 'Depósito' : 'Retiro'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(aporte.monto)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={aporte.notas}>
                      {aporte.notas || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {aporte.registrador?.nombre || 'N/A'}
                      </div>
                      <div className="text-gray-500">
                        {aporte.registrador?.rol || 'N/A'}
                      </div>
                    </div>
                  </td>
                  {canModify && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(aporte)}
                        className="inline-flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {pagination && onPageChange && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              totalItems={pagination.total}
              itemsPerPage={pagination.per_page}
              onPageChange={onPageChange}
              showFirstLast={true}
              showPrevNext={true}
            />
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          onConfirm={deleteConfirm.onConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
};

export default AhorrosTable;
