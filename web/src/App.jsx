import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import UsuarioForm from './pages/UsuarioForm';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas (solo ADMIN) */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios/nuevo"
            element={
              <ProtectedRoute requireAdmin={true}>
                <UsuarioForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios/editar/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <UsuarioForm />
              </ProtectedRoute>
            }
          />

          {/* Ruta raíz redirige a usuarios */}
          <Route path="/" element={<Navigate to="/usuarios" replace />} />

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/usuarios" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
