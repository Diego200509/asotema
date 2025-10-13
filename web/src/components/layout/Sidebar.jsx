import React from 'react';
import asotemaIcon from '../../assets/icons/asotema.png';

const Sidebar = ({ activeSection, onSectionChange, onLogout, collapsed, onToggle, user }) => {
  const menuItems = [
    {
      id: 'usuarios',
      label: 'Usuarios',
      roles: ['ADMIN'], // Solo ADMIN puede ver esta sección
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'socios',
      label: 'Socios',
      roles: ['ADMIN', 'TESORERO', 'CAJERO'], // Todos pueden ver esta sección
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'prestamos',
      label: 'Préstamos',
      roles: ['ADMIN', 'TESORERO', 'CAJERO'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'ahorros',
      label: 'Ahorros',
      roles: ['ADMIN', 'TESORERO', 'CAJERO'], // Todos pueden ver esta sección
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      id: 'eventos',
      label: 'Eventos',
      roles: ['ADMIN', 'TESORERO', 'CAJERO'], // Todos pueden ver esta sección
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'reportes',
      label: 'Reportes',
      roles: ['ADMIN', 'TESORERO', 'CAJERO'], // Todos pueden ver esta sección
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Filtrar items del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.rol))
  );

  return (
    <aside className={`bg-white border-r border-gray-200 shadow-sm h-screen flex flex-col transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo y botón toggle - Fijo */}
      <div className={`${collapsed ? 'p-3' : 'p-6'} flex-shrink-0`}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <img 
              src={asotemaIcon} 
              alt="ASOTEMA" 
              className={`mx-auto ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
            />
            <button
              onClick={onToggle}
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú de navegación - Con scroll */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${collapsed ? 'px-3' : 'px-6'} pb-4`}>
        <div className="space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? '0' : '0.75rem',
                padding: collapsed ? '0.75rem' : '0.75rem',
                borderRadius: '0.5rem',
                textAlign: 'left',
                transition: 'all 0.2s',
                backgroundColor: activeSection === item.id ? '#16A34A' : 'transparent',
                color: activeSection === item.id ? '#ffffff' : '#374151',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: collapsed ? '0.75rem' : '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#374151';
                }
              }}
              title={collapsed ? item.label : ''}
            >
              <span style={{ color: activeSection === item.id ? '#ffffff' : '#6b7280' }} className="w-6 h-6">
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Sección inferior solo con cerrar sesión - Fija */}
      <div className={`border-t border-gray-200 ${collapsed ? 'p-3' : 'p-6'} flex-shrink-0`}>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              backgroundColor: '#DC2626',
              color: '#ffffff',
              padding: collapsed ? '0.75rem' : '0.75rem',
              fontSize: collapsed ? '0.75rem' : '0.875rem',
              fontWeight: '500',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? '0' : '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#DC2626';
            }}
            title={collapsed ? 'Cerrar Sesión' : ''}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
