import React, { useState } from 'react';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Alert from '../shared/Alert';

const LoginForm = ({ onSubmit, loading = false, error = '' }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ correo, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert type="error">{error}</Alert>
      )}

      <Input
        label="Correo Electrónico"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="admin@asotema.com"
        required
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
