import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import axios from '../../config/axios';
import Modal from '../shared/Modal';
import UsuarioFormFields from './UsuarioFormFields';
import Button from '../shared/Button';

const UsuarioModal = ({ 
  isOpen, 
  onClose, 
  usuarioId = null, 
  onSuccess 
}) => {
  const isEdit = Boolean(usuarioId);
  const { showSuccess, showError } = useToast();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'CAJERO',
    activo: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        fetchUsuario();
      } else {
        // Reset form for new user
        setFormData({
          nombre: '',
          correo: '',
          password: '',
          rol: 'CAJERO',
          activo: true,
        });
      }
    }
  }, [isOpen, isEdit, usuarioId]);

  const fetchUsuario = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/usuarios/${usuarioId}`);
      if (response.data.success) {
        const usuario = response.data.data;
        setFormData({
          nombre: usuario.nombre,
          correo: usuario.correo,
          password: '', // No mostrar la contraseña
          rol: usuario.rol,
          activo: usuario.activo,
        });
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      showError('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = { ...formData };
      
      // Si es edición y no se cambió la contraseña, no enviarla
      if (isEdit && !dataToSend.password) {
        delete dataToSend.password;
      }

      const response = isEdit
        ? await axios.put(`/usuarios/${usuarioId}`, dataToSend)
        : await axios.post('/usuarios', dataToSend);

      if (response.data.success) {
        showSuccess(isEdit ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar usuario';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h2>

        {loading && isEdit ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <UsuarioFormFields
              formData={formData}
              onChange={handleChange}
              isEdit={isEdit}
              currentUser={currentUser}
            />
            
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                className="flex-1"
              >
                {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
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

export default UsuarioModal;
