import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { EyeIcon } from '@heroicons/react/24/outline';
import { formatDateForEcuador } from '../../utils/dateUtils';

const ListaSociosReportes = ({ onViewReporte }) => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showError } = useToast();

  const itemsPerPage = 6;

  // Cargar socios
  const fetchSocios = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/socios', {
        params: {
          page,
          per_page: itemsPerPage
        }
      });

      setSocios(response.data.data?.data || []);
      setTotalPages(response.data.data?.last_page || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      showError('Error al cargar la lista de socios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const handlePageChange = (page) => {
    fetchSocios(page);
  };

  const getEstadoBadgeVariant = (estado) => {
    return estado === 'ACTIVO' ? 'success' : 'danger';
  };

  return (
    <Card className="flex-1 flex flex-col">
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando socios...</p>
            </div>
          </div>
        ) : socios.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">No se encontraron socios</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Tabla con scroll interno */}
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Socio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Ingreso
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {socios.map((socio) => (
                    <tr key={socio.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {socio.nombres} {socio.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{socio.cedula}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getEstadoBadgeVariant(socio.estado)}>
                          {socio.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateForEcuador(socio.fecha_ingreso)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => onViewReporte(socio)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver Reportes"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ListaSociosReportes;
