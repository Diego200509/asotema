import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  totalItems = 0,
  perPage = 6
}) => {
  // Siempre mostrar información de página, pero solo controles si hay más de una página

  // Calcular qué páginas mostrar
  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    // Ajustar start si estamos cerca del final
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
      {/* Información de la página */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </div>
      )}
      
      {/* Controles de paginación - Solo mostrar si hay más de una página */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
        {/* Primera página */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            title="Primera página"
          >
            ««
          </button>
        )}
        
        {/* Página anterior */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
          title="Página anterior"
        >
          «
        </button>
        
        {/* Números de página */}
        <div className="flex gap-1">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm ${
                page === currentPage
                  ? 'text-white border font-semibold'
                  : 'text-gray-800 bg-white border border-gray-400 hover:bg-gray-100 hover:border-gray-500'
              }`}
              style={page === currentPage ? {
                backgroundColor: '#16A34A',
                borderColor: '#16A34A'
              } : {}}
            >
              {page}
            </button>
          ))}
        </div>
        
        {/* Página siguiente */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
          title="Página siguiente"
        >
          »
        </button>
        
        {/* Última página */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            title="Última página"
          >
            »»
          </button>
        )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
