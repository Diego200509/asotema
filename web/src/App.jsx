import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import UsuarioForm from './pages/UsuarioForm';
import Socios from './pages/Socios';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
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

            {/* Rutas de Socios (todos los roles autenticados) */}
            <Route
              path="/socios"
              element={
                <ProtectedRoute>
                  <Socios />
                </ProtectedRoute>
              }
            />

            {/* Ruta raíz redirige a socios */}
            <Route path="/" element={<Navigate to="/socios" replace />} />

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/socios" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
