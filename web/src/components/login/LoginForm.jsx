import React, { useState } from 'react';
import Input from '../shared/Input';
import PasswordInput from '../shared/PasswordInput';

const LoginForm = ({ onSubmit, loading = false }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validación básica antes de enviar
    if (!correo || !password) {
      return;
    }
    
    onSubmit({ correo, password });
    
    // Limpiar los campos después del envío
    setCorreo('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Correo Electrónico"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="admin@asotema.com"
        required
      />

      <PasswordInput
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          backgroundColor: loading ? '#9ca3af' : '#16A34A',
          color: '#ffffff',
          padding: '0.625rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: loading ? 0.5 : 1,
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#15803d';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#16A34A';
          }
        }}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export default LoginForm;
