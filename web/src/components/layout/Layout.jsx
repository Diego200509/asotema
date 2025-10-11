import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../shared/Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('socios');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

      // Detectar la sección activa según la ruta actual
      useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/usuarios')) {
          setActiveSection('usuarios');
        } else if (path.startsWith('/socios')) {
          setActiveSection('socios');
        } else if (path.startsWith('/prestamos')) {
          setActiveSection('prestamos');
        } else if (path.startsWith('/reportes')) {
          setActiveSection('reportes');
        }
      }, [location]);

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
        } else if (section === 'reportes') {
          navigate('/reportes');
        }
        // Agregar más secciones según sea necesario
      };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
