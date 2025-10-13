import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../shared/Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Función para determinar la sección activa basada en la ruta
  const getActiveSectionFromPath = (path) => {
    if (path.startsWith('/usuarios')) return 'usuarios';
    if (path.startsWith('/socios')) return 'socios';
    if (path.startsWith('/prestamos')) return 'prestamos';
    if (path.startsWith('/ahorros')) return 'ahorros';
    if (path.startsWith('/reportes')) return 'reportes';
    return 'socios'; // fallback por defecto
  };
  
  const [activeSection, setActiveSection] = useState(() => getActiveSectionFromPath(location.pathname));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Cargar el estado del sidebar desde localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Detectar la sección activa según la ruta actual
  useEffect(() => {
    const newActiveSection = getActiveSectionFromPath(location.pathname);
    setActiveSection(newActiveSection);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

      const handleSectionChange = (section) => {
        setActiveSection(section);
        // Navegar a la sección correspondiente
        if (section === 'usuarios') {
          navigate('/usuarios');
        } else if (section === 'socios') {
          navigate('/socios');
        } else if (section === 'prestamos') {
          navigate('/prestamos');
        } else if (section === 'ahorros') {
          navigate('/ahorros/historico');
        } else if (section === 'reportes') {
          navigate('/reportes');
        }
        // Agregar más secciones según sea necesario
      };

  const toggleSidebar = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    // Guardar el estado en localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsedState));
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar fijo */}
      <div className="flex-shrink-0">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          user={user}
        />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <Header
          title=""
          subtitle=""
          user={user}
        />
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
