import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchableChecklist = ({ 
  items = [],
  selectedItems = [],
  onSelectionChange,
  label = "Seleccionar items",
  placeholder = "Buscar...",
  loading = false,
  disabled = false,
  maxHeight = "300px",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const dropdownRef = useRef(null);

  // Filtrar items basado en búsqueda
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Verificar si todos están seleccionados
  useEffect(() => {
    if (filteredItems.length === 0) {
      setIsAllSelected(false);
      return;
    }
    
    const allFilteredSelected = filteredItems.every(item => 
      selectedItems.includes(item.value)
    );
    setIsAllSelected(allFilteredSelected);
  }, [filteredItems, selectedItems]);

  // Manejar selección individual
  const handleItemToggle = (itemValue) => {
    const newSelection = selectedItems.includes(itemValue)
      ? selectedItems.filter(id => id !== itemValue)
      : [...selectedItems, itemValue];
    
    onSelectionChange(newSelection);
  };

  // Manejar seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deseleccionar todos los filtrados
      const newSelection = selectedItems.filter(id => 
        !filteredItems.some(item => item.value === id)
      );
      onSelectionChange(newSelection);
    } else {
      // Seleccionar todos los filtrados
      const newSelection = [...new Set([
        ...selectedItems,
        ...filteredItems.map(item => item.value)
      ])];
      onSelectionChange(newSelection);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCount = selectedItems.length;
  const filteredCount = filteredItems.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {selectedCount > 0 && (
          <span className="text-green-600 ml-2">
            ({selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''})
          </span>
        )}
      </label>

      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          w-full px-3 py-2 text-left border rounded-md shadow-sm
          focus:ring-2 focus:ring-green-500 focus:border-green-500
          ${disabled || loading 
            ? 'bg-gray-50 cursor-not-allowed text-gray-400' 
            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
          }
          flex items-center justify-between
        `}
      >
        <span className="truncate">
          {loading ? 'Cargando...' : 
           selectedCount === 0 ? 'Seleccionar socios...' :
           selectedCount === 1 ? '1 socio seleccionado' :
           `${selectedCount} socios seleccionados`}
        </span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Barra de búsqueda */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          {/* Opciones */}
          <div 
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredCount === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? 'No se encontraron resultados' : 'No hay items disponibles'}
              </div>
            ) : (
              <>
                {/* Seleccionar todos */}
                {filteredCount > 1 && (
                  <div className="px-3 py-2 border-b border-gray-100">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Seleccionar todos los filtrados ({filteredCount})
                      </span>
                    </label>
                  </div>
                )}

                {/* Items */}
                {filteredItems.map((item) => (
                  <div key={item.value} className="px-3 py-2 hover:bg-gray-50">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.value)}
                        onChange={() => handleItemToggle(item.value)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-900 flex-1">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs text-gray-500">
                          {item.subtitle}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer con contador */}
          {selectedCount > 0 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              {selectedCount} de {items.length} seleccionados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableChecklist;
