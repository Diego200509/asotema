import { formatCurrency } from '../../utils/formatters';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

const ResumenEvento = ({ evento, resumen, onContabilizar, onReversar, canEdit, loading }) => {
  const asistentesConfirmados = resumen?.asistentes?.confirmados || 0;
  
  // Calcular valores según el tipo de evento
  let ingresoEstimado = 0;
  let costoEstimado = 0;
  let netoEstimado = 0;
  
  if (evento?.tipo_evento === 'COMPARTIDO') {
    const valorEvento = parseFloat(evento?.valor_evento || 0);
    const aporteSocio = parseFloat(evento?.aporte_socio || 0);
    const aporteAsotema = parseFloat(evento?.aporte_asotema || 0);
    
    ingresoEstimado = asistentesConfirmados * valorEvento;
    costoEstimado = asistentesConfirmados * aporteAsotema;
    netoEstimado = asistentesConfirmados * aporteSocio;
  } else if (evento?.tipo_evento === 'CUBRE_ASOTEMA') {
    const costoPorSocio = parseFloat(evento?.costo_por_socio || 0);
    
    ingresoEstimado = 0;
    costoEstimado = asistentesConfirmados * costoPorSocio;
    netoEstimado = 0;
  }

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
                <>Valor del evento = Aporte del socio + Aporte de ASOTEMA. Se descontará el aporte del socio de su cuenta corriente y el aporte de ASOTEMA de la cuenta institucional.</>
              ) : (
                <>ASOTEMA cubrirá todo el costo del evento por cada socio que participe. Se descontará el costo por socio de la cuenta institucional de ASOTEMA.</>
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

        {/* Campos específicos según tipo de evento */}
        {evento?.tipo_evento === 'COMPARTIDO' && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs font-medium text-blue-700 mb-1">Valor/Evento</div>
              <div className="text-lg font-bold text-blue-900">{formatCurrency(evento?.valor_evento || 0)}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-xs font-medium text-orange-700 mb-1">Aporte Socio</div>
              <div className="text-lg font-bold text-orange-900">{formatCurrency(evento?.aporte_socio || 0)}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-xs font-medium text-red-700 mb-1">Aporte ASOTEMA</div>
              <div className="text-lg font-bold text-red-900">{formatCurrency(evento?.aporte_asotema || 0)}</div>
            </div>
          </div>
        )}

        {evento?.tipo_evento === 'CUBRE_ASOTEMA' && (
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-xs font-medium text-red-700 mb-1">Costo por Socio</div>
            <div className="text-lg font-bold text-red-900">{formatCurrency(evento?.costo_por_socio || 0)}</div>
          </div>
        )}

        {/* Ingresos - Solo para eventos que generen ingresos reales */}
        {evento?.clase === 'INGRESO' && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">
                {evento?.contabilizado ? 'Ingresos Totales' : 'Ingresos Estimados'}
              </span>
              <span className="text-xl font-bold text-green-900">{formatCurrency(ingresos)}</span>
            </div>
            <div className="mt-1 text-xs text-green-600">
              {asistentesConfirmados} × {formatCurrency(evento?.monto_ingreso || 0)}
            </div>
          </div>
        )}

        {/* Gastos Totales */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-orange-700">
              {evento?.contabilizado ? 'Gastos Totales' : 'Gastos Estimados'}
            </span>
            <span className="text-xl font-bold text-orange-900">{formatCurrency(costos)}</span>
          </div>
          <div className="mt-1 text-xs text-orange-600">
            {evento?.tipo_evento === 'COMPARTIDO' ? (
              <>{asistentesConfirmados} × {formatCurrency(evento?.valor_evento || 0)} (Total del evento)</>
            ) : (
              <>{asistentesConfirmados} × {formatCurrency(evento?.costo_por_socio || 0)} (Costo por socio)</>
            )}
          </div>
        </div>

        {/* Gastos de Socios - Solo para eventos COMPARTIDO */}
        {evento?.tipo_evento === 'COMPARTIDO' && (
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-700">
                {evento?.contabilizado ? 'Gastos de Socios' : 'Gastos Estimados de Socios'}
              </span>
              <span className="text-xl font-bold text-purple-900">
                {formatCurrency(asistentesConfirmados * (evento?.aporte_socio || 0))}
              </span>
            </div>
            <div className="mt-1 text-xs text-purple-600">
              {asistentesConfirmados} × {formatCurrency(evento?.aporte_socio || 0)} (Aporte por socio)
            </div>
          </div>
        )}

        {/* Neto - Solo para eventos que generen ingresos reales */}
        {evento?.clase === 'INGRESO' && (
          <div className={`${neto >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${neto >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {evento?.contabilizado ? 'Neto Real' : 'Neto Estimado'}
              </span>
              <span className={`text-2xl font-bold ${neto >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                {formatCurrency(neto)}
              </span>
            </div>
            <div className="mt-1 text-xs text-blue-600">
              Ingreso menos costos
            </div>
          </div>
        )}

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
