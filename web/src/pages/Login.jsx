import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoginHeader from '../components/login/LoginHeader';
import LoginCard from '../components/login/LoginCard';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async ({ correo, password }) => {
    setLoading(true);

    const result = await login(correo, password);

    if (result.success) {
      showSuccess('¡Bienvenido! Sesión iniciada correctamente');
      navigate('/usuarios');
    } else {
      showError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <LoginHeader />
        <LoginCard 
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Login;

