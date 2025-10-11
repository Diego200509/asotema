import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../shared/Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('usuarios');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
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
