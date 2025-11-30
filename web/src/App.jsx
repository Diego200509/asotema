import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import UsuarioForm from './pages/UsuarioForm';
import Socios from './pages/Socios';
import SocioDetalle from './pages/SocioDetalle';
import Prestamos from './pages/Prestamos';
import PrestamoDetalle from './pages/PrestamoDetalle';
import AhorrosLote from './pages/AhorrosLote';
import AhorrosHistorico from './pages/AhorrosHistorico';
import Eventos from './pages/Eventos';
import EventoDetalle from './pages/EventoDetalle';
import Reportes from './pages/Reportes';
import DescuentosMensuales from './pages/DescuentosMensuales';

// Componente para redirigir según el rol
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Cargando...</p>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={user.rol === 'CAJERO' ? '/reportes' : '/socios'} replace />;
};

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

            {/* Rutas de Socios (ADMIN y TESORERO solamente) */}
            <Route
              path="/socios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <Socios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/socios/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <SocioDetalle />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Préstamos (ADMIN y TESORERO solamente) */}
            <Route
              path="/prestamos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <Prestamos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prestamos/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <PrestamoDetalle />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Ahorros (ADMIN y TESORERO solamente) */}
            <Route
              path="/ahorros/lote"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <AhorrosLote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ahorros/historico"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <AhorrosHistorico />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Eventos (ADMIN y TESORERO solamente) */}
            <Route
              path="/eventos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <Eventos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <EventoDetalle />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Reportes (ADMIN, TESORERO y CAJERO) */}
            <Route
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO', 'CAJERO']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes/descuentos-mensuales"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO', 'CAJERO']}>
                  <DescuentosMensuales />
                </ProtectedRoute>
              }
            />

            {/* Ruta raíz - redirige según el rol */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Ruta 404 - redirige según el rol */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
