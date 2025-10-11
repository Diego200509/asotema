import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';

const PagarCuotaModal = ({ isOpen, onClose, prestamoId, onSuccess }) => {
  const { showSuccess, showError } = useToast();

  const [prestamo, setPrestamo] = useState(null);
  const [formData, setFormData] = useState({
    numero_cuota: '',
    monto: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingPrestamo, setLoadingPrestamo] = useState(false);

  useEffect(() => {
    if (isOpen && prestamoId) {
      fetchPrestamo();
    }
  }, [isOpen, prestamoId]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        numero_cuota: '',
        monto: ''
      });
    }
  }, [isOpen]);

  const fetchPrestamo = async () => {
    setLoadingPrestamo(true);
    try {
      const response = await axios.get(`/prestamos/${prestamoId}`);
      if (response.data.success) {
        setPrestamo(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar préstamo:', error);
      showError('Error al cargar préstamo');
      onClose();
    } finally {
      setLoadingPrestamo(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC');
  };

  const getCuotaOptions = () => {
    if (!prestamo?.cuotas) return [];

    return prestamo.cuotas
      .filter(cuota => cuota.estado !== 'PAGADA')
      .map(cuota => ({
        value: cuota.numero_cuota,
        label: `Cuota ${cuota.numero_cuota} - ${formatDate(cuota.fecha_vencimiento)} - ${formatCurrency(cuota.monto_esperado - cuota.monto_pagado)} pendiente`
      }));
  };

  const getCuotaSeleccionada = () => {
    if (!prestamo?.cuotas || !formData.numero_cuota) return null;
    return prestamo.cuotas.find(cuota => cuota.numero_cuota == formData.numero_cuota);
  };

  const cuotaSeleccionada = getCuotaSeleccionada();
  const montoPendiente = cuotaSeleccionada ? cuotaSeleccionada.monto_esperado - cuotaSeleccionada.monto_pagado : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.numero_cuota || !formData.monto) {
      showError('Por favor complete todos los campos');
      return;
    }

    const monto = parseFloat(formData.monto);
    if (monto <= 0) {
      showError('El monto debe ser mayor a 0');
      return;
    }

    if (monto > 10000) {
      showError('El monto máximo es $10,000');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/prestamos/${prestamoId}/pagar`, {
        numero_cuota: parseInt(formData.numero_cuota),
        monto: monto
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrar pago';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Registrar Pago de Cuota
        </h2>

        {loadingPrestamo ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Cargando información del préstamo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Información del préstamo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Información del Préstamo
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Préstamo:</span>
                    <div className="font-semibold">#{prestamo?.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Socio:</span>
                    <div className="font-semibold">
                      {prestamo?.socio?.nombres} {prestamo?.socio?.apellidos}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Capital:</span>
                    <div className="font-semibold">{formatCurrency(prestamo?.capital || 0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <div className="font-semibold">{prestamo?.estado}</div>
                  </div>
                </div>
              </div>

              {/* Selección de cuota */}
              <div>
                <Select
                  label="Cuota a Pagar *"
                  name="numero_cuota"
                  value={formData.numero_cuota}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Seleccionar cuota' },
                    ...getCuotaOptions()
                  ]}
                  required
                />
              </div>

              {/* Información de la cuota seleccionada */}
              {cuotaSeleccionada && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Detalle de la Cuota {cuotaSeleccionada.numero_cuota}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Vencimiento:</span>
                      <div className="font-semibold">{formatDate(cuotaSeleccionada.fecha_vencimiento)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Cuota total:</span>
                      <div className="font-semibold">{formatCurrency(cuotaSeleccionada.monto_esperado)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Ya pagado:</span>
                      <div className="font-semibold">{formatCurrency(cuotaSeleccionada.monto_pagado)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Pendiente:</span>
                      <div className="font-semibold text-orange-600">{formatCurrency(montoPendiente)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Monto del pago */}
              <div>
                <Input
                  label="Monto del Pago *"
                  name="monto"
                  type="number"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Puede pagar parcialmente o el monto completo de la cuota
                </p>
              </div>

              {/* Resumen del pago */}
              {formData.monto && cuotaSeleccionada && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Resumen del Pago
                  </h4>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto a pagar:</span>
                      <span className="font-semibold">{formatCurrency(parseFloat(formData.monto) || 0)}</span>
                    </div>
                    {parseFloat(formData.monto) >= montoPendiente && (
                      <div className="text-green-700 font-medium mt-2">
                        ✓ Esta cuota quedará completamente pagada
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !formData.numero_cuota || !formData.monto}
                loading={loading}
                className="flex-1"
              >
                {loading ? 'Registrando...' : 'Registrar Pago'}
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
        )}
      </div>
    </Modal>
  );
};

export default PagarCuotaModal;
