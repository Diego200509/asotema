import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Badge from '../shared/Badge';
import { formatCurrency } from '../../utils/formatters';

const EventosTable = ({ eventos, onView, onEdit, onDelete, onContabilizar, onReversar, canEdit }) => {
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
    return contabilizado ? 'success' : 'secondary';
  };

  const calcularNetoEstimado = (evento) => {
    if (evento.clase === 'INGRESO') {
      return parseFloat(evento.monto_ingreso) || 0;
    }
    const asistentes = evento.total_asistentes_confirmados || 0;
    const precio = parseFloat(evento.precio_por_asistente) || 0;
    const costo = parseFloat(evento.costo_por_asistente) || 0;
    return (precio - costo) * asistentes;
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto/Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Costo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asistentes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Neto Estimado
            </th>
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
              <td className="px-6 py-4 whitespace-nowrap">
                {evento.clase === 'GASTO' && evento.tipo_evento ? (
                  <Badge variant={getTipoBadgeVariant(evento.tipo_evento)}>
                    {evento.tipo_evento}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {evento.clase === 'INGRESO' 
                    ? formatCurrency(evento.monto_ingreso)
                    : formatCurrency(evento.precio_por_asistente)
                  }
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {evento.clase === 'INGRESO' 
                    ? <span className="text-gray-400">-</span>
                    : formatCurrency(evento.costo_por_asistente)
                  }
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {evento.clase === 'INGRESO' 
                    ? <span className="text-gray-400">-</span>
                    : `${evento.total_asistentes_confirmados || 0} / ${evento.total_asistentes || 0}`
                  }
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-semibold ${calcularNetoEstimado(evento) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calcularNetoEstimado(evento))}
                </div>
              </td>
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
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => onDelete(evento.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
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
