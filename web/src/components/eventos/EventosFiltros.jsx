import { useState } from 'react';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { useToast } from '../../context/ToastContext';

const EventosFiltros = ({ filtros, onFiltroChange }) => {
  const [fechasLocales, setFechasLocales] = useState({
    desde: filtros.desde || '',
    hasta: filtros.hasta || ''
  });
  const { showWarning, showError } = useToast();

  const limpiarFiltros = () => {
    onFiltroChange('q', '');
    onFiltroChange('desde', '');
    onFiltroChange('hasta', '');
    onFiltroChange('tipo', '');
    onFiltroChange('contabilizado', '');
    setFechasLocales({ desde: '', hasta: '' });
  };

  const validarFechas = (desde, hasta) => {
    if (desde && hasta) {
      const fechaInicio = new Date(desde);
      const fechaFin = new Date(hasta);
      
      if (fechaFin < fechaInicio) {
        showError('La fecha fin no puede ser anterior a la fecha inicio');
        return false;
      }
    }
    return true;
  };

  const handleFechaChange = (campo, valor) => {
    // Actualizar el estado local primero
    const nuevasFechas = { ...fechasLocales, [campo]: valor };
    setFechasLocales(nuevasFechas);
    
    // Validar fechas
    const esValido = validarFechas(nuevasFechas.desde, nuevasFechas.hasta);
    
    // Solo aplicar filtro si ambas fechas están completas y son válidas
    if (nuevasFechas.desde && nuevasFechas.hasta && esValido) {
      onFiltroChange('desde', nuevasFechas.desde);
      onFiltroChange('hasta', nuevasFechas.hasta);
    } else if (!nuevasFechas.desde || !nuevasFechas.hasta) {
      // Si no están completas, limpiar el filtro
      onFiltroChange('desde', '');
      onFiltroChange('hasta', '');
    }
  };

  const tieneFiltros = filtros.q || (filtros.desde && filtros.hasta) || filtros.tipo || filtros.contabilizado;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${tieneFiltros ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
        <div>
          <Input
            label="Búsqueda"
            placeholder="Nombre o motivo..."
            value={filtros.q}
            onChange={(e) => onFiltroChange('q', e.target.value)}
          />
        </div>
        
        <div>
          <Input
            type="date"
            label="Desde"
            value={fechasLocales.desde}
            onChange={(e) => {
              const valor = e.target.value;
              handleFechaChange('desde', valor);
              if (valor && !fechasLocales.hasta) {
                showWarning('Complete la fecha "Hasta" para aplicar el filtro');
              }
            }}
            placeholder="dd/mm/aaaa"
          />
        </div>
        
        <div>
          <Input
            type="date"
            label="Hasta"
            value={fechasLocales.hasta}
            onChange={(e) => {
              const valor = e.target.value;
              handleFechaChange('hasta', valor);
              if (valor && !fechasLocales.desde) {
                showWarning('Complete la fecha "Desde" para aplicar el filtro');
              }
            }}
            placeholder="dd/mm/aaaa"
          />
        </div>
        
        <div>
          <Select
            label="Tipo"
            value={filtros.tipo}
            onChange={(e) => onFiltroChange('tipo', e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'COMPARTIDO', label: 'Compartido' },
              { value: 'CUBRE_ASOTEMA', label: 'Cubre ASOTEMA' }
            ]}
          />
        </div>
        
        <div>
          <Select
            label="Estado"
            value={filtros.contabilizado}
            onChange={(e) => onFiltroChange('contabilizado', e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'false', label: 'Pendiente' },
              { value: 'true', label: 'Contabilizado' }
            ]}
          />
        </div>
        
        {/* Botón limpiar filtros - Solo se muestra cuando hay filtros activos */}
        {tieneFiltros && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {tieneFiltros && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {filtros.q && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Búsqueda: "{filtros.q}"
            </span>
          )}
          {filtros.desde && filtros.hasta && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Desde: {new Date(filtros.desde).toLocaleDateString('es-EC')} - Hasta: {new Date(filtros.hasta).toLocaleDateString('es-EC')}
            </span>
          )}
          {filtros.tipo && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Tipo: {filtros.tipo}
            </span>
          )}
          {filtros.contabilizado && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Estado: {filtros.contabilizado === 'true' ? 'Contabilizado' : 'Pendiente'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EventosFiltros;
