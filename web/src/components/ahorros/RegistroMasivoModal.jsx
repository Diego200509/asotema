import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { ahorrosAPI } from '../../services/api/ahorros';
import Modal from '../shared/Modal';
import MoneyInput from '../shared/MoneyInput';
import MonthPicker from '../shared/MonthPicker';
import SearchableChecklist from '../shared/SearchableChecklist';
import Button from '../shared/Button';
import { getCurrentDateEcuador } from '../../utils/dateUtils';

const RegistroMasivoModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    mes: '',
    fecha_operacion: '',
    monto: '',
    notas: ''
  });
  
  const [socios, setSocios] = useState([]);
  const [selectedSocios, setSelectedSocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);

  // Cargar socios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchSocios();
      // Reset form con valores por defecto
      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
      setFormData({
        mes: currentMonth,
        fecha_operacion: getCurrentDateEcuador(), // Usar fecha de Ecuador
        monto: '',
        notas: ''
      });
      setSelectedSocios([]);
    }
  }, [isOpen]);

  const fetchSocios = async () => {
    setLoadingSocios(true);
    try {
      const response = await ahorrosAPI.getSocios({
        order: 'apellido_asc',
        per_page: 'all'
      });
      
      if (response.success) {
        const sociosData = response.data.map(socio => ({
          value: socio.id,
          label: `${socio.apellidos} ${socio.nombres}`,
          subtitle: socio.cedula
        }));
        setSocios(sociosData);
      }
    } catch (error) {
      console.error('Error al cargar socios:', error);
      showError('Error al cargar la lista de socios');
    } finally {
      setLoadingSocios(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.mes && 
           formData.fecha_operacion && 
           formData.monto && 
           parseFloat(formData.monto) > 0 &&
           selectedSocios.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        mes: formData.mes,
        fecha_operacion: formData.fecha_operacion,
        monto: parseFloat(formData.monto),
        socio_ids: selectedSocios,
        notas: formData.notas || undefined
      };

      const response = await ahorrosAPI.registrarDepositoLote(payload);
      
      if (response.success) {
        const { exitosos, errores } = response.data;
        
        let message = `Procesamiento completado: ${exitosos.length} exitosos`;
        if (errores.length > 0) {
          message += `, ${errores.length} con errores`;
        }
        
        showSuccess(message);
        
        // Mostrar detalles de errores si los hay
        if (errores.length > 0) {
          const errorDetails = errores.map(e => `• Socio ${e.socio_id}: ${e.error}`).join('\n');
          showError(`Errores encontrados:\n${errorDetails}`, 8000);
        }
        
        onSuccess && onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error al registrar depósitos:', error);
      showError(error.response?.data?.message || 'Error al registrar los depósitos');
    } finally {
      setLoading(false);
    }
  };

  const totalMonto = formData.monto && selectedSocios.length > 0 
    ? (parseFloat(formData.monto) * selectedSocios.length).toFixed(2)
    : '0.00';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Ahorros Masivos"
      size="lg"
    >
      <div className="bg-white max-h-[80vh] overflow-y-auto p-6">
        {/* Header informativo */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-800">
                Registro Masivo de Ahorros
              </h3>
              <p className="text-sm text-green-700 mt-2 leading-relaxed">
                Selecciona los socios y registra aportes de ahorro para múltiples personas al mismo tiempo.
                El sistema aplicará el mismo monto a todos los socios seleccionados.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos principales en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MonthPicker
              label="Mes"
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              required
              maxMonth={new Date().toISOString().slice(0, 7)}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Operación <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_operacion"
                value={formData.fecha_operacion}
                onChange={handleChange}
                max={getCurrentDateEcuador()}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* Monto */}
            <div className="md:col-span-2 lg:col-span-1">
              <MoneyInput
                label="Monto por Socio"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="100.00"
                required
                min={1}
                max={10000}
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              maxLength={255}
              placeholder="Notas adicionales sobre el registro masivo..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.notas.length}/255 caracteres
            </p>
          </div>

          {/* Checklist de socios */}
          <div>
            <SearchableChecklist
              items={socios}
              selectedItems={selectedSocios}
              onSelectionChange={setSelectedSocios}
              label="Socios a Registrar"
              placeholder="Buscar por nombre o cédula..."
              loading={loadingSocios}
              maxHeight="400px"
            />
          </div>

          {/* Resumen del registro */}
          {selectedSocios.length > 0 && formData.monto && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resumen del Registro
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium mb-1">Socios Seleccionados</div>
                  <div className="text-xl font-bold text-blue-800">{selectedSocios.length}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium mb-1">Monto por Socio</div>
                  <div className="text-xl font-bold text-blue-800">${parseFloat(formData.monto || 0).toFixed(2)}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium mb-1">Total a Registrar</div>
                  <div className="text-xl font-bold text-green-600">${totalMonto}</div>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Información Importante
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-amber-800">Cada socio solo puede tener un depósito por mes</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-amber-800">El sistema creará automáticamente las cuentas de ahorro si no existen</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-amber-800">Los movimientos contables se registrarán automáticamente</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-amber-800">Recibirás un resumen detallado del procesamiento</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid() || loading}
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Registrando...' : 'Registrar Ahorros'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegistroMasivoModal;