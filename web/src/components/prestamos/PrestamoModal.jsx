import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Modal from '../shared/Modal';
import PrestamoFormFields from './PrestamoFormFields';
import CronogramaPreview from './CronogramaPreview';
import Button from '../shared/Button';

const PrestamoModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    socio_id: '',
    capital: '',
    plazo_meses: '',
    fecha_inicio: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        socio_id: '',
        capital: '',
        plazo_meses: '',
        fecha_inicio: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isFormValid = () => {
    return formData.socio_id && 
           formData.capital && 
           parseFloat(formData.capital) >= 100 &&
           parseFloat(formData.capital) <= 50000 &&
           formData.plazo_meses && 
           formData.fecha_inicio;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      showError('Por favor complete todos los campos correctamente');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        socio_id: parseInt(formData.socio_id),
        capital: parseFloat(formData.capital),
        plazo_meses: parseInt(formData.plazo_meses),
        fecha_inicio: formData.fecha_inicio
      };

      const response = await axios.post('/prestamos', dataToSend);

      if (response.data.success) {
        showSuccess('Préstamo creado exitosamente');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear préstamo';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Crear Nuevo Préstamo
        </h2>

        <form onSubmit={handleSubmit}>
          <PrestamoFormFields
            formData={formData}
            onChange={handleChange}
          />
          
          <CronogramaPreview
            capital={formData.capital}
            plazo={formData.plazo_meses}
            fechaInicio={formData.fecha_inicio}
          />
          
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isFormValid()}
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear Préstamo'}
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

export default PrestamoModal;
