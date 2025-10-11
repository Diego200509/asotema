import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { ahorrosAPI } from '../services/api/ahorros';
import Layout from '../components/layout/Layout';
import AhorrosFiltros from '../components/ahorros/AhorrosFiltros';
import AhorrosTable from '../components/ahorros/AhorrosTable';
import RegistroMasivoModal from '../components/ahorros/RegistroMasivoModal';
import Pagination from '../components/shared/Pagination';
import Button from '../components/shared/Button';

const AhorrosHistorico = () => {
  const { showError } = useToast();
  
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 6,
    total: 0
  });
  
  const [filtros, setFiltros] = useState({
    socio_id: '',
    mes: '',
    tipo: '',
    q: ''
  });

  const [showRegistroMasivo, setShowRegistroMasivo] = useState(false);

  // Cargar aportes cuando cambien los filtros o la página
  useEffect(() => {
    fetchAportes();
  }, [filtros, pagination.current_page]);

  const fetchAportes = async () => {
    setLoading(true);
    try {
      const response = await ahorrosAPI.getAportes({
        ...filtros,
        page: pagination.current_page,
        per_page: pagination.per_page
      });
      
      if (response.success) {
        setAportes(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        }));
      }
    } catch (error) {
      console.error('Error al cargar aportes:', error);
      showError('Error al cargar el historial de ahorros');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current_page: page
    }));
  };

  const handleFiltrosChange = (newFiltros) => {
    setFiltros(newFiltros);
    setPagination(prev => ({
      ...prev,
      current_page: 1 // Reset a la primera página
    }));
  };

  return (
    <Layout activeSection="ahorros">
      <div className="space-y-6 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Ahorros</h1>
            <p className="text-gray-600">Consulta todos los aportes de ahorro registrados en el sistema</p>
          </div>
          <Button
            onClick={() => setShowRegistroMasivo(true)}
            className="inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrar Ahorros Masivos
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Página Actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.current_page} de {pagination.last_page}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registros por Página</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.per_page}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <AhorrosFiltros
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          showSocioFilter={true}
          loading={loading}
        />

        {/* Tabla de aportes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Aportes de Ahorro
              {pagination.total > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.total} registros)
                </span>
              )}
            </h3>
          </div>
          
          <AhorrosTable
            aportes={aportes}
            loading={loading}
            onRefresh={fetchAportes}
            showSocio={true}
            pagination={pagination.last_page > 1 ? pagination : null}
            onPageChange={pagination.last_page > 1 ? handlePageChange : null}
          />
        </div>


        {/* Modal de registro masivo */}
        <RegistroMasivoModal
          isOpen={showRegistroMasivo}
          onClose={() => setShowRegistroMasivo(false)}
          onSuccess={() => {
            fetchAportes(); // Recargar la lista después del registro
          }}
        />
      </div>
    </Layout>
  );
};

export default AhorrosHistorico;
