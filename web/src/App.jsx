import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
            <Route
              path="/socios/:id"
              element={
                <ProtectedRoute>
                  <SocioDetalle />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Préstamos (todos los roles autenticados) */}
            <Route
              path="/prestamos"
              element={
                <ProtectedRoute>
                  <Prestamos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prestamos/:id"
              element={
                <ProtectedRoute>
                  <PrestamoDetalle />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Ahorros (todos los roles autenticados) */}
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
                <ProtectedRoute>
                  <AhorrosHistorico />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Eventos (todos los roles autenticados) */}
            <Route
              path="/eventos"
              element={
                <ProtectedRoute>
                  <Eventos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos/:id"
              element={
                <ProtectedRoute>
                  <EventoDetalle />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Reportes (solo ADMIN y TESORERO) */}
            <Route
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes/descuentos-mensuales"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TESORERO']}>
                  <DescuentosMensuales />
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
