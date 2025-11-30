import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import AhorrosResumen from '../ahorros/AhorrosResumen';
import AhorrosTable from '../ahorros/AhorrosTable';
import AhorrosFiltros from '../ahorros/AhorrosFiltros';
import PrestamoSocioTable from '../prestamos/PrestamoSocioTable';
import Pagination from '../shared/Pagination';
import { ahorrosAPI } from '../../services/api/ahorros';
import { prestamosAPI } from '../../services/api/prestamos';
import { formatDateForEcuador } from '../../utils/dateUtils';

const SocioDetalleTabs = ({ socio }) => {
  const [activeTab, setActiveTab] = useState('datos');
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [loadingEstado, setLoadingEstado] = useState(false);
  
  // Estados para préstamos
  const [prestamos, setPrestamos] = useState([]);
  const [loadingPrestamos, setLoadingPrestamos] = useState(false);
  const [paginationPrestamos, setPaginationPrestamos] = useState({
    current_page: 1,
    per_page: 6,
    last_page: 1,
    total: 0
  });
  const [paginationMovimientos, setPaginationMovimientos] = useState({
    current_page: 1,
    per_page: 6,
    total: 0
  });
  
  // Estados para la pestaña de ahorros
  const [aportesAhorro, setAportesAhorro] = useState([]);
  const [loadingAportes, setLoadingAportes] = useState(false);
  const [paginationAhorro, setPaginationAhorro] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 6,
    total: 0
  });
  const [filtrosAhorro, setFiltrosAhorro] = useState({
    socio_id: '',
    mes: '',
    tipo: '',
    q: ''
  });
  
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const canModify = user && (user.rol === 'ADMIN' || user.rol === 'TESORERO');

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

  const fetchEstadoCuenta = async () => {
    if (!socio?.id) return;
    
    setLoadingEstado(true);
    try {
      const response = await axios.get(`/reportes/socio/${socio.id}/estado`);
      if (response.data.success) {
        setEstadoCuenta(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error);
      showError('Error al cargar estado de cuenta');
    } finally {
      setLoadingEstado(false);
    }
  };

  // Función para cargar aportes de ahorro
  const fetchAportesAhorro = async () => {
    if (!socio?.id) return;
    
    setLoadingAportes(true);
    try {
      // Forzar el filtro por socio_id
      const params = {
        socio_id: socio.id,
        mes: filtrosAhorro.mes || '',
        tipo: filtrosAhorro.tipo || '',
        q: filtrosAhorro.q || '',
        page: paginationAhorro.current_page,
        per_page: paginationAhorro.per_page
      };
      
      const response = await ahorrosAPI.getAportes(params);
      
      if (response.success) {
        setAportesAhorro(response.data.data || []);
        setPaginationAhorro({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Error al cargar aportes de ahorro:', error);
      showError('Error al cargar los aportes de ahorro');
    } finally {
      setLoadingAportes(false);
    }
  };

  // Función para manejar cambio de página
  const handlePageChangeAhorro = (page) => {
    setPaginationAhorro(prev => ({
      ...prev,
      current_page: page
    }));
  };

  // Función para manejar cambio de página de movimientos
  const handlePageChangeMovimientos = (page) => {
    setPaginationMovimientos(prev => ({
      ...prev,
      current_page: page
    }));
  };

  // Función para cargar préstamos del socio
  const fetchPrestamos = async () => {
    if (!socio?.id) return;
    
    setLoadingPrestamos(true);
    try {
      // Usar el endpoint general con filtro de socio_id
      const response = await axios.get('/prestamos', {
        params: {
          socio_id: socio.id,
          page: paginationPrestamos.current_page,
          per_page: paginationPrestamos.per_page
        }
      });
      
      if (response.data.success) {
        setPrestamos(response.data.data.data || []);
        setPaginationPrestamos({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
          per_page: paginationPrestamos.per_page
        });
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      showError('Error al cargar préstamos');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  // Función para manejar cambio de página de préstamos
  const handlePageChangePrestamos = (page) => {
    setPaginationPrestamos(prev => ({
      ...prev,
      current_page: page
    }));
  };

  // Cargar aportes cuando cambie la pestaña, filtros o página
  React.useEffect(() => {
    if (activeTab === 'ahorros') {
      fetchAportesAhorro();
    }
  }, [activeTab, filtrosAhorro, paginationAhorro.current_page, socio?.id]);

  // Cargar préstamos cuando cambie la pestaña o página
  React.useEffect(() => {
    if (activeTab === 'prestamos') {
      fetchPrestamos();
    }
  }, [activeTab, paginationPrestamos.current_page, socio?.id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'estado' && !estadoCuenta) {
      fetchEstadoCuenta();
    }
  };


  const tabs = [
    { id: 'datos', label: 'Datos' },
    { id: 'prestamos', label: 'Préstamos' },
    { id: 'ahorros', label: 'Ahorros' },
    { id: 'estado', label: 'Estado de Cuenta' }
  ];

  return (
    <div className="flex flex-col h-full min-h-0"> {/* SCROLL-FIX: Flex column layout */}
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200"> {/* SCROLL-FIX: Fixed tabs header */}
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content with scroll area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"> {/* SCROLL-FIX: Scrollable content area */}
        {activeTab === 'datos' && (
          <div className="p-6 pb-24"> {/* SCROLL-FIX: Padding bottom for sticky pagination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Información Personal
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cédula:</span>
                  <span className="font-medium">{socio.cedula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium">{socio.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombres:</span>
                  <span className="font-medium">{socio.nombres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Apellidos:</span>
                  <span className="font-medium">{socio.apellidos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-medium">{socio.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correo:</span>
                  <span className="font-medium">{socio.correo}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Afiliación
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <Badge variant={socio.estado === 'ACTIVO' ? 'success' : 'danger'}>
                    {socio.estado}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de ingreso:</span>
                  <span className="font-medium">{formatDate(socio.fecha_ingreso)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado:</span>
                  <span className="font-medium">{formatDate(socio.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'prestamos' && (
          <div className="flex flex-col h-full min-h-0"> {/* SCROLL-FIX: Flex column for Préstamos content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"> {/* SCROLL-FIX: Scrollable content for Préstamos */}
              <div className="p-6 pb-4"> {/* SCROLL-FIX: Reduced padding bottom */}
                <PrestamoSocioTable
                  prestamos={prestamos}
                  loading={loadingPrestamos}
                />
              </div>
            </div>
            {/* SCROLL-FIX: Paginación para préstamos - sticky al fondo */}
            {paginationPrestamos.last_page > 1 && (
              <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 flex-shrink-0"> {/* SCROLL-FIX: Sticky pagination */}
                <Pagination
                  currentPage={paginationPrestamos.current_page}
                  totalPages={paginationPrestamos.last_page}
                  totalItems={paginationPrestamos.total}
                  perPage={paginationPrestamos.per_page}
                  onPageChange={handlePageChangePrestamos}
                  showInfo={true}
                  showFirstLast={true}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'estado' && (
          <div className="p-6 pb-4"> {/* SCROLL-FIX: Reduced padding bottom */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Estado de Cuenta
                </h4>
              </div>

              {loadingEstado ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-600">Cargando estado de cuenta...</p>
                </div>
              ) : estadoCuenta ? (
                <div className="space-y-6">
                {/* Resumen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Resumen de la Cuenta</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total movimientos:</span>
                      <div className="font-semibold">{estadoCuenta.resumen?.total_movimientos || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total debe:</span>
                      <div className="font-semibold">{formatCurrency(estadoCuenta.resumen?.total_debe || 0)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total haber:</span>
                      <div className="font-semibold">{formatCurrency(estadoCuenta.resumen?.total_haber || 0)}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="text-gray-600">Saldo actual:</span>
                    <div className={`font-bold text-lg ${(estadoCuenta.saldo_actual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(estadoCuenta.saldo_actual || 0)}
                    </div>
                  </div>
                </div>

                {/* Movimientos */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="font-semibold text-gray-900">Movimientos</h5>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Fecha
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
                        {estadoCuenta.movimientos?.slice(
                          (paginationMovimientos.current_page - 1) * paginationMovimientos.per_page,
                          paginationMovimientos.current_page * paginationMovimientos.per_page
                        ).map((movimiento, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(movimiento.fecha)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-600">No se encontró información de la cuenta</p>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Pestaña Ahorros */}
        {activeTab === 'ahorros' && (
          <div className="p-6 pb-4"> {/* SCROLL-FIX: Reduced padding bottom */}
            <div className="space-y-6">
              {/* Resumen de ahorros */}
              <AhorrosResumen socioId={socio.id} />

              {/* Filtros */}
              <AhorrosFiltros
                filtros={filtrosAhorro}
                onFiltrosChange={setFiltrosAhorro}
                showSocioFilter={false}
                loading={loadingAportes}
              />

              {/* Título del historial */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Historial de Ahorros</h3>
              </div>

              {/* Tabla de aportes */}
              <AhorrosTable
                aportes={aportesAhorro}
                loading={loadingAportes}
                onRefresh={fetchAportesAhorro}
                showSocio={false}
                pagination={null}
                onPageChange={null}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Pagination for Estado de Cuenta */}
      {activeTab === 'estado' && estadoCuenta?.movimientos && Math.ceil(estadoCuenta.movimientos.length / paginationMovimientos.per_page) > 1 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4"> {/* SCROLL-FIX: Sticky pagination */}
          <Pagination
            currentPage={paginationMovimientos.current_page}
            totalPages={Math.ceil(estadoCuenta.movimientos.length / paginationMovimientos.per_page)}
            totalItems={estadoCuenta.movimientos.length}
            perPage={paginationMovimientos.per_page}
            onPageChange={handlePageChangeMovimientos}
            showInfo={true}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Sticky Pagination for Ahorros */}
      {activeTab === 'ahorros' && paginationAhorro.last_page > 1 && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4"> {/* SCROLL-FIX: Sticky pagination */}
          <Pagination
            currentPage={paginationAhorro.current_page}
            totalPages={paginationAhorro.last_page}
            totalItems={paginationAhorro.total}
            perPage={paginationAhorro.per_page}
            onPageChange={handlePageChangeAhorro}
            showInfo={true}
            showFirstLast={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
};

export default SocioDetalleTabs;
