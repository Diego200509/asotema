import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import MonthPicker from '../shared/MonthPicker';

const AhorrosFiltros = ({ 
  filtros, 
  onFiltrosChange, 
  showSocioFilter = true,
  loading = false 
}) => {
  const [busqueda, setBusqueda] = useState(filtros.q || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFiltrosChange({
      ...filtros,
      [name]: value
    });
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    // Debounce para la búsqueda
    clearTimeout(window.busquedaTimeout);
    window.busquedaTimeout = setTimeout(() => {
      onFiltrosChange({
        ...filtros,
        q: e.target.value
      });
    }, 500);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    onFiltrosChange({
      socio_id: filtros.socio_id || '', // Preservar socio_id si existe
      mes: '',
      tipo: '',
      q: ''
    });
  };

  const tieneFiltros = filtros.socio_id || filtros.mes || filtros.tipo || filtros.q;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda general */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Búsqueda
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={handleBusquedaChange}
              placeholder="Buscar por nombre, cédula..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Filtro por mes */}
        <div>
          <MonthPicker
            label="Mes"
            name="mes"
            value={filtros.mes || ''}
            onChange={handleChange}
          />
        </div>

        {/* Filtro por tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            name="tipo"
            value={filtros.tipo || ''}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los tipos</option>
            <option value="DEPOSITO">Depósito</option>
            <option value="RETIRO">Retiro</option>
          </select>
        </div>

        {/* Filtro por socio (solo si se muestra) */}
        {showSocioFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Socio
            </label>
            <select
              name="socio_id"
              value={filtros.socio_id || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los socios</option>
              {/* Aquí se pueden cargar los socios si es necesario */}
            </select>
          </div>
        )}

        {/* Botón limpiar filtros */}
        <div className="flex items-end">
          {tieneFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {tieneFiltros && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {filtros.mes && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Mes: {new Date(filtros.mes + '-01').toLocaleDateString('es-EC', { year: 'numeric', month: 'long' })}
            </span>
          )}
          {filtros.tipo && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tipo: {filtros.tipo === 'DEPOSITO' ? 'Depósito' : 'Retiro'}
            </span>
          )}
          {filtros.q && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Búsqueda: "{filtros.q}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AhorrosFiltros;
