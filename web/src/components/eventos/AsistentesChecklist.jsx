import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { sociosAPI } from '../../services/api/socios';

const AsistentesChecklist = ({ eventoId, asistentes, onToggleAsistencia, canEdit, loading: parentLoading }) => {
  const [sociosDisponibles, setSociosDisponibles] = useState([]);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredSocios, setFilteredSocios] = useState([]);

  useEffect(() => {
    fetchSocios();
  }, []);

  useEffect(() => {
    filterSocios();
  }, [search, sociosDisponibles]);

  const fetchSocios = async () => {
    setLoadingSocios(true);
    try {
      const response = await sociosAPI.getSocios({ per_page: 'all', estado: 'ACTIVO' });
      const socios = response.data.data || response.data;
      
      // Ordenar por apellidos y nombres
      const sociosOrdenados = socios.sort((a, b) => {
        const apellidoCompare = a.apellidos.localeCompare(b.apellidos);
        if (apellidoCompare !== 0) return apellidoCompare;
        return a.nombres.localeCompare(b.nombres);
      });

      setSociosDisponibles(sociosOrdenados);
    } catch (error) {
      console.error('Error al cargar socios:', error);
    } finally {
      setLoadingSocios(false);
    }
  };

  const filterSocios = () => {
    if (!search.trim()) {
      setFilteredSocios(sociosDisponibles);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = sociosDisponibles.filter(socio => {
      const nombreCompleto = `${socio.nombres} ${socio.apellidos}`.toLowerCase();
      const cedula = socio.cedula || '';
      return nombreCompleto.includes(searchLower) || cedula.includes(searchLower);
    });

    setFilteredSocios(filtered);
  };

  const getSocioAsistencia = (socioId) => {
    return asistentes.find(a => a.socio_id === socioId);
  };

  const handleToggle = (socioId) => {
    if (!canEdit || parentLoading) return;
    
    const asistente = getSocioAsistencia(socioId);
    const nuevoEstado = asistente ? !asistente.asistio : true;
    onToggleAsistencia(socioId, nuevoEstado);
  };

  const handleSelectAll = () => {
    if (!canEdit || parentLoading) return;
    
    // Marcar todos como asistentes
    filteredSocios.forEach(socio => {
      const asistente = getSocioAsistencia(socio.id);
      if (!asistente || !asistente.asistio) {
        onToggleAsistencia(socio.id, true);
      }
    });
  };

  const handleUnselectAll = () => {
    if (!canEdit || parentLoading) return;
    
    // Desmarcar todos
    filteredSocios.forEach(socio => {
      const asistente = getSocioAsistencia(socio.id);
      if (asistente && asistente.asistio) {
        onToggleAsistencia(socio.id, false);
      }
    });
  };

  if (loadingSocios) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando socios...</div>
      </div>
    );
  }

  const totalAsistentes = asistentes.filter(a => a.asistio).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Lista de Asistentes
          </h3>
          <span className="text-sm text-gray-600">
            {totalAsistentes} asistente{totalAsistentes !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {canEdit && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleSelectAll}
              disabled={parentLoading}
              className="flex-1 px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seleccionar Todos
            </button>
            <button
              onClick={handleUnselectAll}
              disabled={parentLoading}
              className="flex-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deseleccionar Todos
            </button>
          </div>
        )}
      </div>

      {/* Lista de socios */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredSocios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron socios
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSocios.map((socio) => {
              const asistente = getSocioAsistencia(socio.id);
              const asiste = asistente?.asistio || false;

              return (
                <label
                  key={socio.id}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                    !canEdit ? 'cursor-default' : ''
                  } ${parentLoading ? 'opacity-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={asiste}
                    onChange={() => handleToggle(socio.id)}
                    disabled={!canEdit || parentLoading}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {socio.apellidos} {socio.nombres}
                      </p>
                      {asiste && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Asiste
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">CI: {socio.cedula}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistentesChecklist;
