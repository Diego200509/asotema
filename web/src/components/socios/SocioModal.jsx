import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from '../../config/axios';
import Modal from '../shared/Modal';
import SocioFormFields from './SocioFormFields';
import Button from '../shared/Button';

const SocioModal = ({ 
  isOpen, 
  onClose, 
  socioId = null, 
  onSuccess 
}) => {
  const isEdit = Boolean(socioId);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    cedula: '',
    codigo: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: '',
    estado: 'ACTIVO',
    fecha_ingreso: '',
  });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasChanges = () => {
    if (!isEdit || !originalData) {
      return formData.cedula.trim() !== '' || 
             formData.nombres.trim() !== '' || 
             formData.apellidos.trim() !== '';
    }

    return formData.cedula !== originalData.cedula ||
           formData.nombres !== originalData.nombres ||
           formData.apellidos !== originalData.apellidos ||
           formData.telefono !== originalData.telefono ||
           formData.correo !== originalData.correo ||
           formData.estado !== originalData.estado ||
           formData.fecha_ingreso !== originalData.fecha_ingreso;
  };

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        fetchSocio();
      } else {
        const newSocioData = {
          cedula: '',
          codigo: '',
          nombres: '',
          apellidos: '',
          telefono: '',
          correo: '',
          estado: 'ACTIVO',
          fecha_ingreso: '',
        };
        setFormData(newSocioData);
        setOriginalData(null);
      }
    }
  }, [isOpen, isEdit, socioId]);

  const fetchSocio = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/socios/${socioId}`);
      if (response.data.success) {
        const socio = response.data.data;
        const socioData = {
          cedula: socio.cedula,
          codigo: socio.codigo || '',
          nombres: socio.nombres,
          apellidos: socio.apellidos,
          telefono: socio.telefono || '',
          correo: socio.correo || '',
          estado: socio.estado,
          fecha_ingreso: socio.fecha_ingreso ? socio.fecha_ingreso.split('T')[0] : '',
        };
        setFormData(socioData);
        setOriginalData(socioData);
      }
    } catch (error) {
      console.error('Error al cargar socio:', error);
      showError('Error al cargar socio');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono || null,
        correo: formData.correo || null,
        estado: formData.estado,
        fecha_ingreso: formData.fecha_ingreso || null,
      };

      const response = isEdit
        ? await axios.put(`/socios/${socioId}`, dataToSend)
        : await axios.post('/socios', dataToSend);

      if (response.data.success) {
        showSuccess(isEdit ? 'Socio actualizado exitosamente' : 'Socio creado exitosamente');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar socio:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar socio';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const title = isEdit ? 'Editar Socio' : 'Crear Nuevo Socio';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {title}
        </h2>

        {loading && isEdit ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <SocioFormFields
              formData={formData}
              onChange={handleChange}
              isEdit={isEdit}
            />
            
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !hasChanges()}
                loading={loading}
                className="flex-1"
              >
                {loading ? (isEdit ? 'Actualizando...' : 'Creando...') : (isEdit ? 'Actualizar Socio' : 'Crear Socio')}
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

export default SocioModal;

