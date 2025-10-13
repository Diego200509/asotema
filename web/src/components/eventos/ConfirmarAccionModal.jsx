import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

const ConfirmarAccionModal = ({ isOpen, onClose, onConfirm, tipo, titulo, mensaje, loading }) => {
  const getTipoConfig = () => {
    switch (tipo) {
      case 'contabilizar':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          btnColor: 'bg-green-600 hover:bg-green-700',
          btnText: 'Contabilizar',
        };
      case 'reversar':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-100',
          btnColor: 'bg-orange-600 hover:bg-orange-700',
          btnText: 'Reversar',
        };
      case 'eliminar':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          btnColor: 'bg-red-600 hover:bg-red-700',
          btnText: 'Eliminar',
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          btnColor: 'bg-gray-600 hover:bg-gray-700',
          btnText: 'Confirmar',
        };
    }
  };

  const config = getTipoConfig();
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${config.bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {titulo}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {mensaje}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={`w-full sm:w-auto ${config.btnColor} text-white focus:ring-offset-2`}
        >
          {loading ? 'Procesando...' : config.btnText}
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="secondary"
          className="w-full sm:w-auto mt-3 sm:mt-0"
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmarAccionModal;
