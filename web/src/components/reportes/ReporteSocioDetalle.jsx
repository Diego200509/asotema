import React, { useState } from 'react';
import EstadoCuentaReporte from './EstadoCuentaReporte';
import AhorrosReporte from './AhorrosReporte';
import PrestamosReporte from './PrestamosReporte';

const ReporteSocioDetalle = ({ socio }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('reportes_active_tab');
    return saved || 'estado-cuenta';
  });

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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('reportes_active_tab', tabId);
  };

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white">
      {/* Pestañas */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-600 text-gray-900'
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

export default ReporteSocioDetalle;
