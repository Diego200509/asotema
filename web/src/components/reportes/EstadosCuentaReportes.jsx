import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Badge from '../shared/Badge';
import ListaSociosReportes from './ListaSociosReportes';
import ReporteSocioDetalle from './ReporteSocioDetalle';

const EstadosCuentaReportes = ({ onBack }) => {
  const [selectedSocio, setSelectedSocio] = useState(() => {
    const saved = localStorage.getItem('reportes_selected_socio');
    return saved ? JSON.parse(saved) : null;
  });

  const handleViewReporte = (socio) => {
    setSelectedSocio(socio);
    localStorage.setItem('reportes_selected_socio', JSON.stringify(socio));
  };

  const handleBack = () => {
    setSelectedSocio(null);
    localStorage.removeItem('reportes_selected_socio');
    localStorage.removeItem('reportes_active_tab');
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
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estados de Cuenta</h1>
            <p className="text-gray-600">Seleccione un socio para ver sus reportes</p>
          </div>
        </div>
      </div>

      <ListaSociosReportes onViewReporte={handleViewReporte} />
    </div>
  );
};

export default EstadosCuentaReportes;