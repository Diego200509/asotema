import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import PDFPreview from '../shared/PDFPreview';

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

export default PrestamosReporte;
