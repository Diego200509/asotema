import React from 'react';

const Sidebar = ({ activeSection, onSectionChange, onLogout, collapsed, onToggle }) => {
  const menuItems = [
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'ventas',
      label: 'Ventas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      )
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 shadow-sm h-screen flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`flex-1 ${collapsed ? 'p-2' : 'p-6'}`}>
        {/* Logo y botón toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">ASOTEMA</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión</p>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
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

        {/* Menú de navegación */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
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
                justifyContent: collapsed ? 'center' : 'flex-start'
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
              <span style={{ color: activeSection === item.id ? '#ffffff' : '#6b7280' }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Sección inferior solo con cerrar sesión */}
      <div className={`border-t border-gray-200 ${collapsed ? 'p-2' : 'p-6'}`}>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              backgroundColor: '#DC2626',
              color: '#ffffff',
              padding: collapsed ? '0.75rem' : '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? '0' : '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#DC2626';
            }}
            title={collapsed ? 'Cerrar Sesión' : ''}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
