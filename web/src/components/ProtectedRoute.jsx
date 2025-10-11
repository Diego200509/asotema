import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './shared/Button';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.rol !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página</p>
          <Button
            variant="primary"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

