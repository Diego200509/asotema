import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Badge from '../shared/Badge';
import { formatCurrency } from '../../utils/formatters';

const EventosTable = ({ eventos, onView, onEdit, onDelete, onContabilizar, onReversar, canEdit, toggleClase }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-EC', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getClaseBadgeVariant = (clase) => {
    return clase === 'INGRESO' ? 'success' : 'info';
  };

  const getTipoBadgeVariant = (tipo) => {
    return tipo === 'COMPARTIDO' ? 'info' : 'warning';
  };

  const getEstadoBadgeVariant = (contabilizado) => {
    return contabilizado ? 'success' : 'warning';
  };


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Motivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Clase
            </th>
            {toggleClase === 'GASTO' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {toggleClase === 'INGRESO' ? 'Monto' : 'Valor/Costo'}
            </th>
            {toggleClase === 'GASTO' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aporte Socio
              </th>
            )}
            {toggleClase === 'GASTO' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asistentes
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {eventos.map((evento) => (
            <tr key={evento.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{evento.nombre}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-xs truncate" title={evento.motivo}>
                  {evento.motivo}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatDate(evento.fecha_evento)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getClaseBadgeVariant(evento.clase)}>
                  {evento.clase}
                </Badge>
              </td>
              {toggleClase === 'GASTO' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {evento.tipo_evento ? (
                    <Badge variant={getTipoBadgeVariant(evento.tipo_evento)}>
                      {evento.tipo_evento}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {evento.clase === 'INGRESO' 
                    ? formatCurrency(evento.monto_ingreso)
                    : evento.tipo_evento === 'COMPARTIDO' 
                      ? formatCurrency(evento.valor_evento)
                      : formatCurrency(evento.costo_por_socio)
                  }
                </div>
              </td>
              {toggleClase === 'GASTO' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {evento.tipo_evento === 'COMPARTIDO' 
                      ? formatCurrency(evento.aporte_socio)
                      : <span className="text-gray-400">-</span>
                    }
                  </div>
                </td>
              )}
              {toggleClase === 'GASTO' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {`${evento.total_asistentes_confirmados || 0} / ${evento.total_asistentes || 0}`}
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getEstadoBadgeVariant(evento.contabilizado)}>
                  {evento.contabilizado ? 'Contabilizado' : 'Pendiente'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {evento.clase === 'GASTO' && (
                    <button
                      onClick={() => onView(evento.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalle"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  {canEdit && !evento.contabilizado && (
                    <>
                      <button
                        onClick={() => onEdit(evento.id)}
                        className="text-primary hover:text-primary-700 transition-colors duration-200 p-1 rounded hover:bg-primary-50"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => onDelete(evento.id)}
                        className="text-danger hover:text-danger-700 transition-colors duration-200 p-1 rounded hover:bg-danger-50"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      
                      {evento.clase === 'GASTO' && (
                        <button
                          onClick={() => onContabilizar(evento.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Contabilizar"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </>
                  )}
                  
                  {canEdit && evento.contabilizado && (
                    <button
                      onClick={() => onReversar(evento.id)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Reversar"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {eventos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay eventos registrados</p>
        </div>
      )}
    </div>
  );
};

export default EventosTable;
