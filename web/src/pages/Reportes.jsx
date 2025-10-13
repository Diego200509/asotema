import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/shared/Card';
import EstadosCuentaReportes from '../components/reportes/EstadosCuentaReportes';

const Reportes = () => {
  const [activeReport, setActiveReport] = useState(null);

  const handleReportClick = (reportType) => {
    setActiveReport(reportType);
  };

  const handleBack = () => {
    setActiveReport(null);
  };

  // Si hay un reporte activo, mostrar el componente correspondiente
  if (activeReport === 'estados-cuenta') {
    return (
      <Layout>
        <EstadosCuentaReportes onBack={handleBack} />
      </Layout>
    );
  }

  // Vista principal con las tarjetas de reportes
  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Módulo de reportes financieros</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cartera de Préstamos
              </h3>
              <p className="text-gray-600 mb-4">
                Reporte de capital pendiente en cartera
              </p>
              <button 
                onClick={() => handleReportClick('cartera-prestamos')}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Ver Reporte →
              </button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ingresos por Intereses
              </h3>
              <p className="text-gray-600 mb-4">
                Reporte de ingresos generados por intereses
              </p>
              <button 
                onClick={() => handleReportClick('ingresos-intereses')}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Ver Reporte →
              </button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Estados de Cuenta
              </h3>
              <p className="text-gray-600 mb-4">
                Estados de cuenta de socios individuales
              </p>
              <button 
                onClick={() => handleReportClick('estados-cuenta')}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Ver Reporte →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reportes;
