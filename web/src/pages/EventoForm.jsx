import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import eventosService from '../services/eventosService';
import { useToast } from '../context/ToastContext';
import EventoFormFields from '../components/eventos/EventoFormFields';
import Button from '../components/shared/Button';
import { getCurrentDateTimeEcuador } from '../utils/dateUtils';

const EventoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nombre: '',
    motivo: '',
    fecha_evento: '',
    tipo_evento: '',
    precio_por_asistente: '',
    costo_por_asistente: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchEvento();
    } else {
      // Para nuevo evento, establecer fecha mínima como ahora
      const currentDateTime = getCurrentDateTimeEcuador();
      setFormData(prev => ({ ...prev, fecha_evento: currentDateTime }));
    }
  }, [id]);

  const fetchEvento = async () => {
    setLoadingData(true);
    try {
      const response = await eventosService.get(id);
      const evento = response.data.evento;
      
      // Verificar si está contabilizado
      if (evento.contabilizado) {
        showError('No se puede editar un evento que ya está contabilizado');
        navigate('/eventos');
        return;
      }

      // Formatear fecha para input datetime-local
      const fechaEvento = new Date(evento.fecha_evento);
      const year = fechaEvento.getFullYear();
      const month = String(fechaEvento.getMonth() + 1).padStart(2, '0');
      const day = String(fechaEvento.getDate()).padStart(2, '0');
      const hours = String(fechaEvento.getHours()).padStart(2, '0');
      const minutes = String(fechaEvento.getMinutes()).padStart(2, '0');
      const fechaFormateada = `${year}-${month}-${day}T${hours}:${minutes}`;

      setFormData({
        nombre: evento.nombre || '',
        motivo: evento.motivo || '',
        fecha_evento: fechaFormateada,
        tipo_evento: evento.tipo_evento || '',
        precio_por_asistente: evento.precio_por_asistente || '',
        costo_por_asistente: evento.costo_por_asistente || '',
      });
    } catch (error) {
      console.error('Error al cargar evento:', error);
      showError('Error al cargar los datos del evento');
      navigate('/eventos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es obligatorio';
    }

    if (!formData.fecha_evento) {
      newErrors.fecha_evento = 'La fecha del evento es obligatoria';
    } else {
      const fechaEvento = new Date(formData.fecha_evento);
      const ahora = new Date();
      if (fechaEvento <= ahora) {
        newErrors.fecha_evento = 'La fecha del evento debe ser futura';
      }
    }

    if (!formData.tipo_evento) {
      newErrors.tipo_evento = 'El tipo de evento es obligatorio';
    }

    if (!formData.precio_por_asistente || parseFloat(formData.precio_por_asistente) < 0) {
      newErrors.precio_por_asistente = 'El precio debe ser mayor o igual a 0';
    }

    if (!formData.costo_por_asistente || parseFloat(formData.costo_por_asistente) < 0) {
      newErrors.costo_por_asistente = 'El costo debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showError('Por favor, corrija los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para envío
      const dataToSend = {
        nombre: formData.nombre.trim(),
        motivo: formData.motivo.trim(),
        fecha_evento: formData.fecha_evento + ':00-05:00', // Agregar segundos y timezone de Ecuador
        tipo_evento: formData.tipo_evento,
        precio_por_asistente: parseFloat(formData.precio_por_asistente),
        costo_por_asistente: parseFloat(formData.costo_por_asistente),
      };

      if (isEdit) {
        await eventosService.update(id, dataToSend);
        showSuccess('Evento actualizado exitosamente');
      } else {
        await eventosService.create(dataToSend);
        showSuccess('Evento creado exitosamente');
      }

      navigate('/eventos');
    } catch (error) {
      console.error('Error al guardar evento:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el evento';
      showError(errorMessage);

      // Procesar errores de validación del backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/eventos');
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos del evento...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a eventos
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
        </h1>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <EventoFormFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
          isEdit={isEdit}
        />

        {/* Botones */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar Evento' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventoForm;
