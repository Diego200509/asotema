import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Badge from '../shared/Badge';
import Pagination from '../shared/Pagination';
import PDFPreview from '../shared/PDFPreview';
import { formatDateForEcuador } from '../../utils/dateUtils';

const EstadoCuentaAsotema = ({ onBack }) => {
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paginationMovimientos, setPaginationMovimientos] = useState({
    current_page: 1,
    per_page: 10,
    total: 0
  });
  const { showError } = useToast();

  useEffect(() => {
    fetchEstadoCuenta();
  }, []);

  const fetchEstadoCuenta = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/reportes/estado-asotema');
      if (response.data.success) {
        setEstadoCuenta(response.data.data);
        setPaginationMovimientos(prev => ({
          ...prev,
          total: response.data.data.movimientos_consolidados.length
        }));
      }
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error);
      showError('Error al cargar el estado de cuenta de ASOTEMA');
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChangeMovimientos = (page) => {
    setPaginationMovimientos(prev => ({
      ...prev,
      current_page: page
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">Cargando estado de cuenta...</p>
      </div>
    );
  }

  if (!estadoCuenta) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">No se encontró información del estado de cuenta</p>
      </div>
    );
  }

  const movimientosPaginados = estadoCuenta.movimientos_consolidados.slice(
    (paginationMovimientos.current_page - 1) * paginationMovimientos.per_page,
    paginationMovimientos.current_page * paginationMovimientos.per_page
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Estado de Cuenta ASOTEMA</h1>
              <p className="text-gray-600">Estado de cuenta consolidado de todas las cuentas institucionales</p>
            </div>
          </div>
          {estadoCuenta && (
            <div className="flex space-x-3">
              <PDFPreview
                url="/reportes/estado-asotema/preview"
                filename={`estado_cuenta_asotema_${new Date().toISOString().split('T')[0]}.pdf`}
                previewButtonText="Vista Previa"
                downloadButtonText="Descargar PDF"
                showBothButtons={true}
                buttonVariant="secondary"
                downloadButtonVariant="success"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-6 pb-4">
        {/* Resumen General */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4 text-lg">Resumen General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Cuentas:</span>
              <div className="font-semibold text-lg">{estadoCuenta.resumen_general.total_cuentas}</div>
            </div>
            <div>
              <span className="text-gray-600">Total Movimientos:</span>
              <div className="font-semibold text-lg">{estadoCuenta.resumen_general.total_movimientos}</div>
            </div>
            <div>
              <span className="text-gray-600">Total Debe:</span>
              <div className="font-semibold text-lg">{formatCurrency(estadoCuenta.resumen_general.total_debe)}</div>
            </div>
            <div>
              <span className="text-gray-600">Total Haber:</span>
              <div className="font-semibold text-lg">{formatCurrency(estadoCuenta.resumen_general.total_haber)}</div>
            </div>
            <div>
              <span className="text-gray-600">Saldo Total:</span>
              <div className={`font-bold text-lg ${estadoCuenta.resumen_general.saldo_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(estadoCuenta.resumen_general.saldo_total)}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen por Cuenta */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Resumen por Cuenta</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Cuenta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Movimientos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Debe
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total Haber
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Saldo Actual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estadoCuenta.cuentas.map((cuenta) => (
                  <tr key={cuenta.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cuenta.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cuenta.tipo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {cuenta.resumen.total_movimientos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(cuenta.resumen.total_debe)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(cuenta.resumen.total_haber)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${cuenta.saldo_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cuenta.saldo_actual)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movimientos Consolidados */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Movimientos Consolidados</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Cuenta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Creado por
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  movimientosPaginados.map((movimiento) => (
                    <tr key={`${movimiento.cuenta_id}-${movimiento.id}`} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movimiento.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimiento.cuenta_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={movimiento.tipo === 'DEBE' ? 'danger' : 'success'}>
                          {movimiento.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency(movimiento.monto)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {movimiento.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {movimiento.creado_por}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {Math.ceil(estadoCuenta.movimientos_consolidados.length / paginationMovimientos.per_page) > 1 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 mt-4">
          <Pagination
            currentPage={paginationMovimientos.current_page}
            totalPages={Math.ceil(estadoCuenta.movimientos_consolidados.length / paginationMovimientos.per_page)}
            totalItems={estadoCuenta.movimientos_consolidados.length}
            perPage={paginationMovimientos.per_page}
            onPageChange={handlePageChangeMovimientos}
            showInfo={true}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
};

export default EstadoCuentaAsotema;

