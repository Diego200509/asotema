import React from 'react';

const Alert = ({ 
  children, 
  type = 'info',
  className = '',
  onClose
}) => {
  const typeClasses = {
    success: 'bg-primary-50 border-primary-200 text-primary-700',
    error: 'bg-danger-50 border-danger-200 text-danger-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div className={`p-3 border rounded-lg text-sm ${typeClasses[type]} ${className}`}>
      <div className="flex items-center justify-between">
        <div>{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-current hover:opacity-75 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
