import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Input from '../shared/Input';
import Select from '../shared/Select';

const EventosFiltros = ({ filtros, onFiltroChange, onBuscar }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
            value={filtros.desde}
            onChange={(e) => onFiltroChange('desde', e.target.value)}
          />
        </div>
        
        <div>
          <Input
            type="date"
            label="Hasta"
            value={filtros.hasta}
            onChange={(e) => onFiltroChange('hasta', e.target.value)}
          />
        </div>
        
        <div>
          <Select
            label="Clase"
            value={filtros.clase}
            onChange={(e) => onFiltroChange('clase', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="INGRESO">Ingreso</option>
            <option value="GASTO">Gasto</option>
          </Select>
        </div>
        
        <div>
          <Select
            label="Tipo"
            value={filtros.tipo}
            onChange={(e) => onFiltroChange('tipo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="COMPARTIDO">Compartido</option>
            <option value="CUBRE_ASOTEMA">Cubre ASOTEMA</option>
          </Select>
        </div>
        
        <div>
          <Select
            label="Estado"
            value={filtros.contabilizado}
            onChange={(e) => onFiltroChange('contabilizado', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="false">Pendiente</option>
            <option value="true">Contabilizado</option>
          </Select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          Buscar
        </button>
      </div>
    </form>
  );
};

export default EventosFiltros;
