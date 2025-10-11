import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: '#DC2626',
          confirmBg: '#DC2626',
          confirmHover: '#b91c1c'
        };
      case 'warning':
        return {
          iconColor: '#D97706',
          confirmBg: '#D97706',
          confirmHover: '#B45309'
        };
      case 'primary':
        return {
          iconColor: '#16A34A',
          confirmBg: '#16A34A',
          confirmHover: '#15803d'
        };
      default:
        return {
          iconColor: '#DC2626',
          confirmBg: '#DC2626',
          confirmHover: '#b91c1c'
        };
    }
  };

  const styles = getVariantStyles();

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'primary':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div 
            className="flex-shrink-0 mr-3"
            style={{ color: styles.iconColor }}
          >
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : styles.confirmBg,
              color: '#ffffff',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = styles.confirmHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = styles.confirmBg;
              }
            }}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
