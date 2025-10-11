import React from 'react';
import Card from '../shared/Card';
import LoginForm from './LoginForm';
import LoginCredentials from './LoginCredentials';

const LoginCard = ({ onSubmit, loading, error }) => {
  return (
    <Card padding="lg">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Iniciar Sesión
      </h2>
      
      <LoginForm 
        onSubmit={onSubmit}
        loading={loading}
        error={error}
      />
      
      <LoginCredentials />
    </Card>
  );
};

export default LoginCard;
