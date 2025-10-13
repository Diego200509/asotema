import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import PDFPreview from '../shared/PDFPreview';
import { EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDateForEcuador } from '../../utils/dateUtils';

const EstadosCuentaReportes = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const { showError } = useToast();
  const navigate = useNavigate();

  const itemsPerPage = 10;

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

  const handleViewReporte = (socio) => {
    setSelectedSocio(socio);
  };

  const handleBack = () => {
    setSelectedSocio(null);
  };

  const getEstadoBadgeVariant = (estado) => {
    return estado === 'ACTIVO' ? 'success' : 'danger';
  };

  // Si hay un socio seleccionado, mostrar el detalle de reportes
  if (selectedSocio) {
    return (
      <div className="h-[calc(100vh-115px)] flex flex-col">
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reportes de {selectedSocio.nombres} {selectedSocio.apellidos}
              </h1>
              <p className="text-gray-600">
                Cédula: {selectedSocio.cedula} | Estado: <Badge variant={getEstadoBadgeVariant(selectedSocio.estado)}>{selectedSocio.estado}</Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ReporteSocioDetalle socio={selectedSocio} />
        </div>
      </div>
    );
  }

  // Vista principal con tabla de socios
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estados de Cuenta</h1>
        <p className="text-gray-600">Seleccione un socio para ver sus reportes</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Socios</h2>
        </div>

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
                            onClick={() => handleViewReporte(socio)}
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
    </div>
  );
};

// Componente para mostrar los reportes detallados del socio
const ReporteSocioDetalle = ({ socio }) => {
  const [activeTab, setActiveTab] = useState('estado-cuenta');

  const tabs = [
    {
      id: 'estado-cuenta',
      label: 'Estado de Cuenta',
      component: <EstadoCuentaReporte socio={socio} />
    },
    {
      id: 'ahorros',
      label: 'Reporte de Ahorros',
      component: <AhorrosReporte socio={socio} />
    },
    {
      id: 'prestamos',
      label: 'Reporte de Préstamos',
      component: <PrestamosReporte socio={socio} />
    }
  ];

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white">
      {/* Pestañas */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas con scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

// Componente para el reporte de Estado de Cuenta
const EstadoCuentaReporte = ({ socio }) => {
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [ahorrosResumen, setAhorrosResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  const fetchEstadoCuenta = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/reportes/socio/${socio.id}/estado`);

      if (response.data.success) {
        setEstadoCuenta(response.data.data);
      } else {
        showError('Error al cargar el estado de cuenta');
      }
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error);
      showError('Error al cargar el estado de cuenta');
    } finally {
      setLoading(false);
    }
  };

  const fetchAhorrosResumen = async () => {
    try {
      const response = await axios.get(`/ahorros/socio/${socio.id}/resumen`);
      if (response.data.success) {
        setAhorrosResumen(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar resumen de ahorros:', error);
    }
  };

  useEffect(() => {
    fetchEstadoCuenta();
    fetchAhorrosResumen();
  }, [socio.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando estado de cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Estado de Cuenta General
        </h3>
        <p className="text-sm text-gray-600">
          Movimientos financieros completos del socio
        </p>
      </div>

      {estadoCuenta && (
        <div className="flex flex-col">
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800">Saldo Actual</div>
              <div className="text-2xl font-bold text-green-900">
                ${estadoCuenta.saldo_actual?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Total Depósitos</div>
              <div className="text-2xl font-bold text-blue-900">
                ${ahorrosResumen?.total_depositos?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-800">Total Retiros</div>
              <div className="text-2xl font-bold text-purple-900">
                ${ahorrosResumen?.total_retiros?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
          </div>

            {/* Vista previa del PDF */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Reporte PDF</h4>
                <PDFPreview
                  url={`/socios/${socio.id}/estado-cuenta/pdf`}
                  filename={`estado_cuenta_${socio.cedula}_${socio.nombres}_${socio.apellidos}.pdf`}
                  previewButtonText="Vista Previa"
                  downloadButtonText="Descargar PDF"
                  showBothButtons={true}
                  buttonVariant="outline"
                  downloadButtonVariant="secondary"
                />
              </div>

              {/* Área de vista previa del PDF */}
              <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Haga clic en "Vista Previa" para ver el PDF</p>
                  <p className="text-xs text-gray-500">O use "Descargar PDF" para guardar el archivo</p>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Componente para el reporte de Ahorros
const AhorrosReporte = ({ socio }) => {
  const [ahorros, setAhorros] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  const fetchAhorros = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/ahorros/socios', {
        params: { socio_id: socio.id }
      });

      if (response.data.success) {
        setAhorros(response.data.data?.data || []);
      }
    } catch (error) {
      console.error('Error al cargar ahorros:', error);
      showError('Error al cargar los ahorros del socio');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumen = async () => {
    try {
      const response = await axios.get(`/ahorros/socio/${socio.id}/resumen`);
      if (response.data.success) {
        setResumen(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar resumen de ahorros:', error);
    }
  };

  useEffect(() => {
    fetchAhorros();
    fetchResumen();
  }, [socio.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando ahorros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reporte de Ahorros
        </h3>
        <p className="text-sm text-gray-600">
          Historial de aportes de ahorro del socio
        </p>
      </div>

      {/* Resumen de ahorros */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-800">Total Ahorrado</div>
            <div className="text-2xl font-bold text-green-900">
              ${resumen.saldo_actual?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Aportes Realizados</div>
            <div className="text-2xl font-bold text-blue-900">
              {resumen.total_aportes || 0}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-800">Último Aporte</div>
            <div className="text-sm font-bold text-purple-900">
              {resumen.ultimo_aporte ? formatDateForEcuador(resumen.ultimo_aporte) : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Vista previa del PDF */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">Reporte PDF de Ahorros</h4>
          <PDFPreview
            url={`/socios/${socio.id}/reporte-ahorros/pdf`}
            filename={`reporte_ahorros_${socio.cedula}_${socio.nombres}_${socio.apellidos}.pdf`}
            previewButtonText="Vista Previa"
            downloadButtonText="Descargar PDF"
            showBothButtons={true}
            buttonVariant="outline"
            downloadButtonVariant="secondary"
          />
        </div>

        {/* Área de vista previa del PDF */}
        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Haga clic en "Vista Previa" para ver el PDF</p>
            <p className="text-xs text-gray-500">O use "Descargar PDF" para guardar el archivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para el reporte de Préstamos
const PrestamosReporte = ({ socio }) => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/prestamos', {
        params: { socio_id: socio.id }
      });

      if (response.data.success) {
        setPrestamos(response.data.data?.data || []);
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      showError('Error al cargar los préstamos del socio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, [socio.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando préstamos...</p>
        </div>
      </div>
    );
  }

  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'FINALIZADO': return 'secondary';
      default: return 'danger';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reporte de Préstamos
        </h3>
        <p className="text-sm text-gray-600">
          Historial de préstamos del socio
        </p>
      </div>

      {/* Resumen de préstamos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-800">Total Prestado</div>
          <div className="text-2xl font-bold text-green-900">
            ${prestamos.reduce((sum, p) => sum + parseFloat(p.capital || 0), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Préstamos Activos</div>
          <div className="text-2xl font-bold text-blue-900">
            {prestamos.filter(p => p.estado === 'ACTIVO' || p.estado === 'PENDIENTE').length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-800">Total Pagado</div>
          <div className="text-2xl font-bold text-purple-900">
            ${prestamos.reduce((sum, p) => {
              const totalPagado = p.cuotas?.reduce((cuotaSum, cuota) => 
                cuotaSum + parseFloat(cuota.monto_pagado || 0), 0) || 0;
              return sum + totalPagado;
            }, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-800">Pendiente</div>
          <div className="text-2xl font-bold text-orange-900">
            ${prestamos.reduce((sum, p) => {
              const totalPendiente = p.cuotas?.reduce((cuotaSum, cuota) => {
                const montoEsperado = parseFloat(cuota.monto_esperado || 0);
                const montoPagado = parseFloat(cuota.monto_pagado || 0);
                return cuotaSum + (montoEsperado - montoPagado);
              }, 0) || 0;
              return sum + totalPendiente;
            }, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Vista previa del PDF */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">Reporte PDF de Préstamos</h4>
          <PDFPreview
            url={`/socios/${socio.id}/reporte-prestamos/pdf`}
            filename={`reporte_prestamos_${socio.cedula}_${socio.nombres}_${socio.apellidos}.pdf`}
            previewButtonText="Vista Previa"
            downloadButtonText="Descargar PDF"
            showBothButtons={true}
            buttonVariant="outline"
            downloadButtonVariant="secondary"
          />
        </div>

        {/* Área de vista previa del PDF */}
        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Haga clic en "Vista Previa" para ver el PDF</p>
            <p className="text-xs text-gray-500">O use "Descargar PDF" para guardar el archivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadosCuentaReportes;
