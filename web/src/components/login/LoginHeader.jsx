import React from 'react';
import asotemaIcon from '../../assets/icons/asotema.png';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-4">
        <img 
          src={asotemaIcon} 
          alt="ASOTEMA" 
          className="w-20 h-16"
        />
        <div className="text-left">
          <h1 className="text-4xl font-bold mb-1" style={{ color: '#C93B2D' }}>ASOTEMA</h1>
          <p style={{ color: '#1F6B3B' }}>Sistema de Gestión de Socios</p>
        </div>
      </div>
    </div>
  );
};

export default LoginHeader;
