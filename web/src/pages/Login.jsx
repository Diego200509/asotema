import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginHeader from '../components/login/LoginHeader';
import LoginCard from '../components/login/LoginCard';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async ({ correo, password }) => {
    setError('');
    setLoading(true);

    const result = await login(correo, password);

    if (result.success) {
      navigate('/usuarios');
    } else {
      setError(result.message);
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
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;

