import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import AhorrosResumen from '../ahorros/AhorrosResumen';
import AhorrosTable from '../ahorros/AhorrosTable';
import AhorrosFiltros from '../ahorros/AhorrosFiltros';
import Pagination from '../shared/Pagination';
import { ahorrosAPI } from '../../services/api/ahorros';

const SocioDetalleTabs = ({ socio }) => {
  const [activeTab, setActiveTab] = useState('datos');
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [loadingEstado, setLoadingEstado] = useState(false);
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
    per_page: 15,
    total: 0
  });
  const [filtrosAhorro, setFiltrosAhorro] = useState({
    socio_id: '',
    mes: '',
    tipo: '',
    q: ''
  });
  
  const { user } = useAuth();
  const { showError } = useToast();

  const canModify = user && (user.rol === 'ADMIN' || user.rol === 'TESORERO');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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

  // Cargar aportes cuando cambie la pestaña, filtros o página
  React.useEffect(() => {
    if (activeTab === 'ahorros') {
      fetchAportesAhorro();
    }
  }, [activeTab, filtrosAhorro, paginationAhorro.current_page, socio?.id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'estado' && !estadoCuenta) {
      fetchEstadoCuenta();
    }
  };

  const exportToCSV = () => {
    if (!estadoCuenta?.movimientos) return;

    const headers = ['Fecha', 'Tipo', 'Monto', 'Descripción', 'Saldo Acumulado'];
    const rows = estadoCuenta.movimientos.map(mov => [
      mov.fecha,
      mov.tipo,
      formatCurrency(mov.monto),
      mov.descripcion,
      formatCurrency(mov.saldo_acumulado || 0)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estado_cuenta_${socio.cedula}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'datos', label: 'Datos' },
    { id: 'prestamos', label: 'Préstamos' },
    { id: 'ahorros', label: 'Ahorros' },
    { id: 'estado', label: 'Estado de Cuenta' }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
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

      {/* Tab Content */}
      <div>
        {activeTab === 'datos' && (
          <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
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
          <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Préstamos del Socio
              </h4>
              {canModify && (
                <Button
                  variant="primary"
                  onClick={() => window.location.href = `/prestamos?search=${socio.cedula}`}
                >
                  Ver Préstamos
                </Button>
              )}
            </div>
            <p className="text-gray-600">
              Para ver los préstamos de este socio, haga clic en "Ver Préstamos" o navegue a la sección de Préstamos.
            </p>
          </div>
        )}

        {activeTab === 'estado' && (
          <div className="space-y-6 h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900">
                Estado de Cuenta
              </h4>
              {estadoCuenta && (
                <Button
                  variant="secondary"
                  onClick={exportToCSV}
                >
                  Exportar CSV
                </Button>
              )}
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
                  
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar" style={{ minHeight: '300px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Fecha
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Tipo
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Monto
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Descripción
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Creado por
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estadoCuenta.movimientos?.slice(
                          (paginationMovimientos.current_page - 1) * paginationMovimientos.per_page,
                          paginationMovimientos.current_page * paginationMovimientos.per_page
                        ).map((movimiento, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatDate(movimiento.fecha)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <Badge variant={movimiento.tipo === 'DEBE' ? 'danger' : 'success'}>
                                {movimiento.tipo}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium">
                              {formatCurrency(movimiento.monto)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {movimiento.descripcion}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {movimiento.creado_por}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Paginación para movimientos */}
                  {estadoCuenta?.movimientos && estadoCuenta.movimientos.length > 6 && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <Pagination
                        currentPage={paginationMovimientos.current_page}
                        totalPages={Math.ceil(estadoCuenta.movimientos.length / paginationMovimientos.per_page)}
                        totalItems={estadoCuenta.movimientos.length}
                        itemsPerPage={paginationMovimientos.per_page}
                        onPageChange={handlePageChangeMovimientos}
                        showFirstLast={true}
                        showPrevNext={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-600">No se encontró información de la cuenta</p>
              </div>
            )}
          </div>
        )}

        {/* Pestaña Ahorros */}
        {activeTab === 'ahorros' && (
          <div className="space-y-6 h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
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
              allowDelete={false}
              pagination={paginationAhorro.total > 6 ? paginationAhorro : null}
              onPageChange={paginationAhorro.total > 6 ? handlePageChangeAhorro : null}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default SocioDetalleTabs;
