import Input from '../shared/Input';
import Select from '../shared/Select';

const EventoFormFields = ({ formData, onChange, errors, isEdit }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Nombre del Evento"
          name="nombre"
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          error={errors.nombre}
          required
          placeholder="Ej: Evento de Fin de Año 2025"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={(e) => handleChange('motivo', e.target.value)}
            rows={3}
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              errors.motivo
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="Describe el motivo del evento..."
          />
          {errors.motivo && (
            <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
          )}
        </div>

        <Input
          type="datetime-local"
          label="Fecha y Hora del Evento"
          name="fecha_evento"
          value={formData.fecha_evento}
          onChange={(e) => handleChange('fecha_evento', e.target.value)}
          error={errors.fecha_evento}
          required
        />

        <Select
          label="Clase de Evento"
          name="clase"
          value={formData.clase}
          onChange={(e) => handleChange('clase', e.target.value)}
          error={errors.clase}
          required
          placeholder="Seleccionar clase de evento"
          options={[
            { value: 'INGRESO', label: 'Ingreso (Dinero que ingresa a ASOTEMA)' },
            { value: 'GASTO', label: 'Gasto (Evento con asistentes y costos)' }
          ]}
        />

        {formData.clase === 'INGRESO' && (
          <Input
            type="number"
            label="Monto de Ingreso"
            name="monto_ingreso"
            value={formData.monto_ingreso}
            onChange={(e) => handleChange('monto_ingreso', e.target.value)}
            error={errors.monto_ingreso}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        )}

        {formData.clase === 'GASTO' && (
          <>
            <Select
              label="Tipo de Evento"
              name="tipo_evento"
              value={formData.tipo_evento}
              onChange={(e) => handleChange('tipo_evento', e.target.value)}
              error={errors.tipo_evento}
              required
              placeholder="Seleccionar tipo de evento"
              options={[
                { value: 'COMPARTIDO', label: 'Compartido (Socio paga costo)' },
                { value: 'CUBRE_ASOTEMA', label: 'Cubre ASOTEMA (ASOTEMA paga costo)' }
              ]}
            />
          </>
        )}

        {formData.clase === 'INGRESO' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">
              <strong>Evento de Ingreso:</strong> Este evento registrará un ingreso directo a ASOTEMA. Se contabilizará automáticamente al crear el evento.
            </p>
          </div>
        )}

        {formData.clase === 'GASTO' && formData.tipo_evento && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              {formData.tipo_evento === 'COMPARTIDO' ? (
                <>
                  <strong>Evento Compartido:</strong> Los socios pagarán el costo establecido (se descontará de su cuenta corriente). ASOTEMA recibirá el precio por asistente y neteará la diferencia.
                </>
              ) : (
                <>
                  <strong>Cubre ASOTEMA:</strong> ASOTEMA cubrirá todos los costos del evento. Los socios solo pagarán el precio de entrada. El neto (precio - costo) será asumido por ASOTEMA.
                </>
              )}
            </p>
          </div>
        )}

        {formData.clase === 'GASTO' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              label="Precio por Asistente"
              name="precio_por_asistente"
              value={formData.precio_por_asistente}
              onChange={(e) => handleChange('precio_por_asistente', e.target.value)}
              error={errors.precio_por_asistente}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />

            <Input
              type="number"
              label="Costo por Asistente"
              name="costo_por_asistente"
              value={formData.costo_por_asistente}
              onChange={(e) => handleChange('costo_por_asistente', e.target.value)}
              error={errors.costo_por_asistente}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        )}

        {formData.clase === 'GASTO' && formData.precio_por_asistente && formData.costo_por_asistente && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Neto por Asistente:</span>
              <span className={`text-lg font-bold ${
                (parseFloat(formData.precio_por_asistente) - parseFloat(formData.costo_por_asistente)) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                ${(parseFloat(formData.precio_por_asistente) - parseFloat(formData.costo_por_asistente)).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoFormFields;
