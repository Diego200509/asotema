import React from 'react';
import Button from './Button';

const Header = ({ 
  title,
  subtitle,
  user,
  onLogout,
  children
}) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-600">{user.rol}</p>
              </div>
            )}
            {onLogout && (
              <Button
                variant="danger"
                size="sm"
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-danger-700 bg-danger-50 border border-danger-200 rounded-lg hover:bg-danger-100 transition shadow-soft"
              >
                Cerrar Sesión
              </Button>
            )}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
