import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import eventosService from '../services/eventosService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventosTable from '../components/eventos/EventosTable';
import EventosFiltros from '../components/eventos/EventosFiltros';
import ConfirmarAccionModal from '../components/eventos/ConfirmarAccionModal';
import EventoFormFields from '../components/eventos/EventoFormFields';
import Pagination from '../components/shared/Pagination';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Layout from '../components/layout/Layout';

const Eventos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  
  const [filtros, setFiltros] = useState({
    q: '',
    desde: '',
    hasta: '',
    clase: '',
    tipo: '',
    contabilizado: '',
  });
  
  const [modalConfirmar, setModalConfirmar] = useState({
    isOpen: false,
    tipo: '',
    titulo: '',
    mensaje: '',
    eventoId: null,
    loading: false,
  });

  const [modalFormulario, setModalFormulario] = useState({
    isOpen: false,
    isEdit: false,
    eventoId: null,
    loading: false,
  });

  const [formData, setFormData] = useState({
    nombre: '',
    motivo: '',
    fecha_evento: '',
    clase: '',
    monto_ingreso: '',
    tipo_evento: '',
    precio_por_asistente: '',
    costo_por_asistente: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const canEdit = ['ADMIN', 'TESORERO'].includes(user?.rol);

  useEffect(() => {
    fetchEventos();
  }, [pagination.current_page]);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filtros,
      };
      
      // Limpiar filtros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await eventosService.list(params);
      
      if (response.success && response.data) {
        // La respuesta tiene esta estructura: { success: true, data: { data: [...], meta: {...} } }
        const eventosData = response.data;
        
        setEventos(eventosData.data || []);
        setPagination({
          current_page: eventosData.meta?.current_page || 1,
          last_page: eventosData.meta?.last_page || 1,
          per_page: eventosData.meta?.per_page || 15,
          total: eventosData.meta?.total || 0,
        });
      } else {
        throw new Error(response.message || 'Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar la lista de eventos';
      showError(errorMessage);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleBuscar = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchEventos();
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handleView = (eventoId) => {
    navigate(`/eventos/${eventoId}`);
  };

  const handleEdit = (eventoId) => {
    // Cargar datos del evento para editar
    const evento = eventos.find(e => e.id === eventoId);
    if (evento) {
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
        clase: evento.clase || '',
        monto_ingreso: evento.monto_ingreso || '',
        tipo_evento: evento.tipo_evento || '',
        precio_por_asistente: evento.precio_por_asistente || '',
        costo_por_asistente: evento.costo_por_asistente || '',
      });
      
      setModalFormulario({
        isOpen: true,
        isEdit: true,
        eventoId: eventoId,
        loading: false,
      });
    }
  };

  const handleNuevo = () => {
    // Resetear formulario
    const currentDateTime = new Date();
    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const fechaFormateada = `${year}-${month}-${day}T${hours}:${minutes}`;

    setFormData({
      nombre: '',
      motivo: '',
      fecha_evento: fechaFormateada,
      clase: '',
      monto_ingreso: '',
      tipo_evento: '',
      precio_por_asistente: '',
      costo_por_asistente: '',
    });
    
    setFormErrors({});
    
    setModalFormulario({
      isOpen: true,
      isEdit: false,
      eventoId: null,
      loading: false,
    });
  };

  const handleDelete = (eventoId) => {
    setModalConfirmar({
      isOpen: true,
      tipo: 'eliminar',
      titulo: '¿Eliminar evento?',
      mensaje: 'Esta acción no se puede deshacer. El evento será eliminado permanentemente.',
      eventoId,
      loading: false,
    });
  };

  const handleContabilizar = (eventoId) => {
    setModalConfirmar({
      isOpen: true,
      tipo: 'contabilizar',
      titulo: '¿Contabilizar evento?',
      mensaje: 'Se generarán los movimientos contables para todos los asistentes confirmados. Esta acción registrará los ingresos y costos del evento.',
      eventoId,
      loading: false,
    });
  };

  const handleReversar = (eventoId) => {
    setModalConfirmar({
      isOpen: true,
      tipo: 'reversar',
      titulo: '¿Reversar contabilización?',
      mensaje: 'Se crearán movimientos contables inversos para revertir la contabilización del evento. El evento volverá a estado pendiente.',
      eventoId,
      loading: false,
    });
  };

  const confirmarAccion = async () => {
    setModalConfirmar(prev => ({ ...prev, loading: true }));
    
    try {
      const { tipo, eventoId } = modalConfirmar;
      
      if (tipo === 'eliminar') {
        await eventosService.delete(eventoId);
        showSuccess('Evento eliminado exitosamente');
      } else if (tipo === 'contabilizar') {
        const response = await eventosService.contabilizar(eventoId);
        showSuccess(`Evento contabilizado: ${response.data.asistentes_procesados} asistentes procesados. Neto: $${response.data.neto.toFixed(2)}`);
      } else if (tipo === 'reversar') {
        await eventosService.reversar(eventoId);
        showSuccess('Contabilización revertida exitosamente');
      }
      
      fetchEventos();
      setModalConfirmar({
        isOpen: false,
        tipo: '',
        titulo: '',
        mensaje: '',
        eventoId: null,
        loading: false,
      });
    } catch (error) {
      console.error('Error al ejecutar acción:', error);
      showError(error.response?.data?.message || 'Error al ejecutar la acción');
      setModalConfirmar(prev => ({ ...prev, loading: false }));
    }
  };

  const cerrarModal = () => {
    if (!modalConfirmar.loading) {
      setModalConfirmar({
        isOpen: false,
        tipo: '',
        titulo: '',
        mensaje: '',
        eventoId: null,
        loading: false,
      });
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
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

    if (!formData.clase) {
      newErrors.clase = 'La clase del evento es obligatoria';
    }

    // Validaciones específicas por clase
    if (formData.clase === 'INGRESO') {
      if (!formData.monto_ingreso || parseFloat(formData.monto_ingreso) <= 0) {
        newErrors.monto_ingreso = 'El monto de ingreso debe ser mayor a 0';
      }
    } else if (formData.clase === 'GASTO') {
      if (!formData.tipo_evento) {
        newErrors.tipo_evento = 'El tipo de evento es obligatorio';
      }

      if (!formData.precio_por_asistente || parseFloat(formData.precio_por_asistente) < 0) {
        newErrors.precio_por_asistente = 'El precio debe ser mayor o igual a 0';
      }

      if (!formData.costo_por_asistente || parseFloat(formData.costo_por_asistente) < 0) {
        newErrors.costo_por_asistente = 'El costo debe ser mayor o igual a 0';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrija los errores en el formulario');
      return;
    }

    setModalFormulario(prev => ({ ...prev, loading: true }));

    try {
      // Preparar datos para envío
      const dataToSend = {
        nombre: formData.nombre.trim(),
        motivo: formData.motivo.trim(),
        fecha_evento: formData.fecha_evento + ':00-05:00', // Agregar segundos y timezone de Ecuador
        clase: formData.clase,
      };

      // Agregar campos específicos según la clase
      if (formData.clase === 'INGRESO') {
        dataToSend.monto_ingreso = parseFloat(formData.monto_ingreso);
      } else if (formData.clase === 'GASTO') {
        dataToSend.tipo_evento = formData.tipo_evento;
        dataToSend.precio_por_asistente = parseFloat(formData.precio_por_asistente);
        dataToSend.costo_por_asistente = parseFloat(formData.costo_por_asistente);
      }

      if (modalFormulario.isEdit) {
        await eventosService.update(modalFormulario.eventoId, dataToSend);
        showSuccess('Evento actualizado exitosamente');
      } else {
        const response = await eventosService.create(dataToSend);
        if (formData.clase === 'INGRESO') {
          showSuccess('Evento de ingreso creado y contabilizado exitosamente');
        } else {
          showSuccess('Evento de gasto creado exitosamente');
        }
      }

      // Cerrar modal y recargar datos
      setModalFormulario({
        isOpen: false,
        isEdit: false,
        eventoId: null,
        loading: false,
      });
      
      fetchEventos();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el evento';
      showError(errorMessage);

      // Procesar errores de validación del backend
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setModalFormulario(prev => ({ ...prev, loading: false }));
    }
  };

  const cerrarModalFormulario = () => {
    if (!modalFormulario.loading) {
      setModalFormulario({
        isOpen: false,
        isEdit: false,
        eventoId: null,
        loading: false,
      });
      setFormErrors({});
    }
  };

  return (
    <Layout>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        {canEdit && (
          <Button onClick={handleNuevo}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Evento
          </Button>
        )}
      </div>

      {/* Filtros */}
      <EventosFiltros
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onBuscar={handleBuscar}
      />

      {/* Tabla */}
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Cargando eventos...</div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <EventosTable
                eventos={eventos}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onContabilizar={handleContabilizar}
                onReversar={handleReversar}
                canEdit={canEdit}
              />
            </div>
            
            {/* Paginación */}
            {pagination.last_page > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-white">
                <Pagination
                  currentPage={pagination.current_page}
                  lastPage={pagination.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmarAccionModal
        isOpen={modalConfirmar.isOpen}
        onClose={cerrarModal}
        onConfirm={confirmarAccion}
        tipo={modalConfirmar.tipo}
        titulo={modalConfirmar.titulo}
        mensaje={modalConfirmar.mensaje}
        loading={modalConfirmar.loading}
      />

      {/* Modal del formulario */}
      <Modal 
        isOpen={modalFormulario.isOpen} 
        onClose={cerrarModalFormulario}
        maxWidth="4xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {modalFormulario.isEdit ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>
          
          <form onSubmit={handleFormSubmit}>
            <EventoFormFields
              formData={formData}
              onChange={handleFormChange}
              errors={formErrors}
              isEdit={modalFormulario.isEdit}
            />
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={cerrarModalFormulario}
                disabled={modalFormulario.loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={modalFormulario.loading}
              >
                {modalFormulario.loading ? 'Guardando...' : modalFormulario.isEdit ? 'Actualizar Evento' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
    </Layout>
  );
};

export default Eventos;
