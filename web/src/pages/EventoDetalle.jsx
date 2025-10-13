import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import eventosService from '../services/eventosService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AsistentesChecklist from '../components/eventos/AsistentesChecklist';
import ResumenEvento from '../components/eventos/ResumenEvento';
import ConfirmarAccionModal from '../components/eventos/ConfirmarAccionModal';
import Badge from '../components/shared/Badge';

const EventoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [evento, setEvento] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [modalConfirmar, setModalConfirmar] = useState({
    isOpen: false,
    tipo: '',
    titulo: '',
    mensaje: '',
    loading: false,
  });

  const canEdit = ['ADMIN', 'TESORERO'].includes(user?.rol);
  const canMarkAttendance = ['ADMIN', 'TESORERO', 'CAJERO'].includes(user?.rol);

  useEffect(() => {
    fetchEvento();
  }, [id]);

  const fetchEvento = async () => {
    setLoadingData(true);
    try {
      const response = await eventosService.get(id);
      setEvento(response.data.evento);
      setResumen(response.data.resumen);
      setAsistentes(response.data.evento.asistentes || []);
    } catch (error) {
      console.error('Error al cargar evento:', error);
      showError('Error al cargar el evento');
      navigate('/eventos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleAsistencia = async (socioId, asistio) => {
    setLoading(true);
    try {
      await eventosService.toggleAsistencia(id, socioId, asistio);
      
      // Actualizar asistentes localmente
      setAsistentes(prev => {
        const existente = prev.find(a => a.socio_id === socioId);
        if (existente) {
          return prev.map(a => 
            a.socio_id === socioId ? { ...a, asistio } : a
          );
        } else {
          return [...prev, { socio_id: socioId, asistio }];
        }
      });

      // Recargar datos para actualizar resumen
      await fetchEvento();
      
      showSuccess(asistio ? 'Asistencia marcada' : 'Asistencia desmarcada');
    } catch (error) {
      console.error('Error al cambiar asistencia:', error);
      showError(error.response?.data?.message || 'Error al cambiar asistencia');
    } finally {
      setLoading(false);
    }
  };

  const handleContabilizar = () => {
    setModalConfirmar({
      isOpen: true,
      tipo: 'contabilizar',
      titulo: '¿Contabilizar evento?',
      mensaje: 'Se generarán los movimientos contables para todos los asistentes confirmados. Esta acción registrará los ingresos y costos del evento.',
      loading: false,
    });
  };

  const handleReversar = () => {
    setModalConfirmar({
      isOpen: true,
      tipo: 'reversar',
      titulo: '¿Reversar contabilización?',
      mensaje: 'Se crearán movimientos contables inversos para revertir la contabilización del evento. El evento volverá a estado pendiente.',
      loading: false,
    });
  };

  const confirmarAccion = async () => {
    setModalConfirmar(prev => ({ ...prev, loading: true }));
    
    try {
      const { tipo } = modalConfirmar;
      
      if (tipo === 'contabilizar') {
        const response = await eventosService.contabilizar(id);
        showSuccess(
          `Evento contabilizado exitosamente. ${response.data.asistentes_procesados} asistentes procesados. Neto: $${response.data.neto.toFixed(2)}`
        );
      } else if (tipo === 'reversar') {
        await eventosService.reversar(id);
        showSuccess('Contabilización revertida exitosamente');
      }
      
      await fetchEvento();
      setModalConfirmar({
        isOpen: false,
        tipo: '',
        titulo: '',
        mensaje: '',
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
        loading: false,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-EC', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando evento...</div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Evento no encontrado</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/eventos')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a eventos
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{evento.nombre}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {formatDate(evento.fecha_evento)}
              </div>
              <Badge variant={evento.tipo_evento === 'COMPARTIDO' ? 'info' : 'warning'}>
                {evento.tipo_evento}
              </Badge>
              <Badge variant={evento.contabilizado ? 'success' : 'secondary'}>
                {evento.contabilizado ? 'Contabilizado' : 'Pendiente'}
              </Badge>
            </div>
            <p className="mt-3 text-gray-600">{evento.motivo}</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de asistentes (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <AsistentesChecklist
            eventoId={id}
            asistentes={asistentes}
            onToggleAsistencia={handleToggleAsistencia}
            canEdit={canMarkAttendance && !evento.contabilizado}
            loading={loading}
          />
        </div>

        {/* Resumen (1/3) */}
        <div className="lg:col-span-1">
          <ResumenEvento
            evento={evento}
            resumen={resumen}
            onContabilizar={handleContabilizar}
            onReversar={handleReversar}
            canEdit={canEdit}
            loading={loading}
          />
        </div>
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
    </div>
  );
};

export default EventoDetalle;
