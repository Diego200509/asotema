import { formatCurrency } from '../../utils/formatters';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

const ResumenEvento = ({ evento, resumen, onContabilizar, onReversar, canEdit, loading }) => {
  const asistentesConfirmados = resumen?.asistentes?.confirmados || 0;
  const precioAsistente = parseFloat(evento?.precio_por_asistente || 0);
  const costoAsistente = parseFloat(evento?.costo_por_asistente || 0);
  
  const ingresoEstimado = asistentesConfirmados * precioAsistente;
  const costoEstimado = asistentesConfirmados * costoAsistente;
  const netoEstimado = ingresoEstimado - costoEstimado;

  // Si está contabilizado, usar datos reales
  const ingresos = evento?.contabilizado 
    ? resumen?.financiero?.total_ingresos_reales || 0
    : ingresoEstimado;
  const costos = evento?.contabilizado
    ? resumen?.financiero?.total_costos_reales || 0
    : costoEstimado;
  const neto = evento?.contabilizado
    ? resumen?.financiero?.neto_real || 0
    : netoEstimado;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumen del Evento</h3>
        <Badge variant={evento?.contabilizado ? 'success' : 'secondary'}>
          {evento?.contabilizado ? 'Contabilizado' : 'Pendiente'}
        </Badge>
      </div>

      {/* Información del evento */}
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tipo de Evento</h4>
          <Badge variant={evento?.tipo_evento === 'COMPARTIDO' ? 'info' : 'warning'}>
            {evento?.tipo_evento}
          </Badge>
        </div>

        {evento?.tipo_evento && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              {evento.tipo_evento === 'COMPARTIDO' ? (
                <>Los socios pagan el costo. ASOTEMA netea precio - costo.</>
              ) : (
                <>ASOTEMA cubre todos los costos. Socios solo pagan precio de entrada.</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Cards de resumen */}
      <div className="space-y-3 mb-6">
        {/* Asistentes */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Asistentes Confirmados</span>
            <span className="text-2xl font-bold text-gray-900">{asistentesConfirmados}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Total registrados: {resumen?.asistentes?.total || 0}
          </div>
        </div>

        {/* Precio y Costo por asistente */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-xs font-medium text-green-700 mb-1">Precio/Asistente</div>
            <div className="text-lg font-bold text-green-900">{formatCurrency(precioAsistente)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-xs font-medium text-orange-700 mb-1">Costo/Asistente</div>
            <div className="text-lg font-bold text-orange-900">{formatCurrency(costoAsistente)}</div>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">
              {evento?.contabilizado ? 'Ingresos Totales' : 'Ingresos Estimados'}
            </span>
            <span className="text-xl font-bold text-green-900">{formatCurrency(ingresos)}</span>
          </div>
          <div className="mt-1 text-xs text-green-600">
            {asistentesConfirmados} × {formatCurrency(precioAsistente)}
          </div>
        </div>

        {/* Costos */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-orange-700">
              {evento?.contabilizado ? 'Costos Totales' : 'Costos Estimados'}
            </span>
            <span className="text-xl font-bold text-orange-900">{formatCurrency(costos)}</span>
          </div>
          <div className="mt-1 text-xs text-orange-600">
            {asistentesConfirmados} × {formatCurrency(costoAsistente)}
          </div>
        </div>

        {/* Neto */}
        <div className={`${neto >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg p-4`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${neto >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {evento?.contabilizado ? 'Neto Real' : 'Neto Estimado'}
            </span>
            <span className={`text-2xl font-bold ${neto >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
              {formatCurrency(neto)}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      {canEdit && (
        <div className="space-y-2">
          {!evento?.contabilizado ? (
            <Button
              onClick={onContabilizar}
              disabled={loading || asistentesConfirmados === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Contabilizando...' : 'Contabilizar Evento'}
            </Button>
          ) : (
            <Button
              onClick={onReversar}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Reversando...' : 'Reversar Contabilización'}
            </Button>
          )}
          
          {asistentesConfirmados === 0 && !evento?.contabilizado && (
            <p className="text-xs text-red-600 text-center">
              Debe haber al menos un asistente confirmado para contabilizar
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumenEvento;
