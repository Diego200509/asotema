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
                { value: 'COMPARTIDO', label: 'Compartido (Socio y ASOTEMA aportan)' },
                { value: 'CUBRE_ASOTEMA', label: 'Cubre ASOTEMA (ASOTEMA cubre todo el costo)' }
              ]}
            />

            {formData.tipo_evento === 'COMPARTIDO' && (
              <>
                <Input
                  type="number"
                  label="Aporte del Socio"
                  name="aporte_socio"
                  value={formData.aporte_socio}
                  onChange={(e) => handleChange('aporte_socio', e.target.value)}
                  error={errors.aporte_socio}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />

                <Input
                  type="number"
                  label="Aporte de ASOTEMA"
                  name="aporte_asotema"
                  value={formData.aporte_asotema}
                  onChange={(e) => handleChange('aporte_asotema', e.target.value)}
                  error={errors.aporte_asotema}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />

                {/* Valor del evento calculado automáticamente */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor del Evento (Calculado automáticamente)
                  </label>
                  <div className="text-lg font-bold text-gray-900">
                    ${(parseFloat(formData.aporte_socio || 0) + parseFloat(formData.aporte_asotema || 0)).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Aporte del socio + Aporte de ASOTEMA
                  </p>
                </div>
              </>
            )}

            {formData.tipo_evento === 'CUBRE_ASOTEMA' && (
              <Input
                type="number"
                label="Costo por Socio"
                name="costo_por_socio"
                value={formData.costo_por_socio}
                onChange={(e) => handleChange('costo_por_socio', e.target.value)}
                error={errors.costo_por_socio}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            )}
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
                  <strong>Evento Compartido:</strong> Valor del evento = Aporte del socio + Aporte de ASOTEMA. Se descontará el aporte del socio de su cuenta corriente y el aporte de ASOTEMA de la cuenta institucional.
                </>
              ) : (
                <>
                  <strong>Cubre ASOTEMA:</strong> ASOTEMA cubrirá todo el costo del evento por cada socio que participe. Se descontará el costo por socio de la cuenta institucional de ASOTEMA.
                </>
              )}
            </p>
          </div>
        )}

        {formData.clase === 'GASTO' && formData.tipo_evento === 'COMPARTIDO' && 
         formData.aporte_socio && formData.aporte_asotema && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Valor Total del Evento:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${(parseFloat(formData.aporte_socio || 0) + parseFloat(formData.aporte_asotema || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Aporte del Socio:</span>
                <span className="text-sm font-medium text-orange-600">
                  ${parseFloat(formData.aporte_socio).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Aporte de ASOTEMA:</span>
                <span className="text-sm font-medium text-red-600">
                  ${parseFloat(formData.aporte_asotema).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {formData.clase === 'GASTO' && formData.tipo_evento === 'CUBRE_ASOTEMA' && 
         formData.costo_por_socio && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Costo por Socio:</span>
              <span className="text-lg font-bold text-red-600">
                ${parseFloat(formData.costo_por_socio).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Este costo se descontará de la cuenta de ASOTEMA por cada socio que participe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoFormFields;
