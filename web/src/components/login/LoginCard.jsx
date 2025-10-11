import React from 'react';
import Card from '../shared/Card';
import LoginForm from './LoginForm';
import LoginCredentials from './LoginCredentials';

const LoginCard = ({ onSubmit, loading }) => {
  return (
    <Card padding="lg">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Iniciar Sesión
      </h2>
      
      <LoginForm 
        onSubmit={onSubmit}
        loading={loading}
      />
      
      <LoginCredentials />
    </Card>
  );
};

export default LoginCard;
