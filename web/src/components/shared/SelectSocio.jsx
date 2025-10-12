import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../config/axios';
import useDebounce from '../../hooks/useDebounce';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { useToast } from '../../context/ToastContext';

const SelectSocio = ({
  value = null,
  onChange,
  placeholder = "Buscar por nombre o cédula...",
  className = "",
  disabled = false,
  required = false,
  errorMessage = null,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [socios, setSocios] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [selectedSocio, setSelectedSocio] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  const { showError } = useToast();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const fetchSociosRef = useRef(null);

  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Formatear nombre completo
  const formatSocioName = (socio) => {
    return `${socio.nombres} ${socio.apellidos} — (${socio.cedula})`;
  };

  // Resaltar término de búsqueda en el texto
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Cargar socios desde la API
  const fetchSocios = async (page = 1, search = '', reset = false) => {
    if (isLoading) return; // Evitar llamadas simultáneas
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/socios', {
        params: {
          per_page: 10,
          page,
          q: search
        }
      });

      const newSocios = response.data.data?.data || [];
      const meta = response.data.data || {};

      if (reset) {
        setSocios(newSocios);
        setCurrentPage(1);
        setHasMore(meta.current_page < meta.last_page);
      } else {
        setSocios(prev => [...prev, ...newSocios]);
        setHasMore(meta.current_page < meta.last_page);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error al cargar socios:', err);
      setError('Error al cargar los socios');
      showError('Error al cargar la lista de socios');
    } finally {
      setIsLoading(false);
    }
  };

  // Mantener referencia estable de fetchSocios
  fetchSociosRef.current = fetchSocios;

  // Cargar más elementos (para infinite scroll)
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && currentPage > 0) {
      fetchSociosRef.current(currentPage + 1, debouncedSearchTerm, false);
    }
  }, [currentPage, debouncedSearchTerm, isLoading, hasMore]);

  // Hook para infinite scroll
  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore, isLoading);

  // Efecto para buscar cuando cambia el término debounced
  useEffect(() => {
    if (debouncedSearchTerm !== undefined && isOpen) {
      const timeoutId = setTimeout(() => {
        if (!isLoading) {
          if (debouncedSearchTerm.trim() !== '') {
            // Buscar con filtro
            fetchSociosRef.current(1, debouncedSearchTerm, true);
          } else {
            // Cargar todos los socios cuando se borra el filtro
            fetchSociosRef.current(1, '', true);
            // Limpiar la selección visual cuando se borra el filtro
            setSelectedIndex(-1);
          }
        }
      }, 100); // Pequeño delay para evitar llamadas múltiples
      
      return () => clearTimeout(timeoutId);
    }
  }, [debouncedSearchTerm]);

  // Efecto para establecer el socio preseleccionado
  useEffect(() => {
    if (value) {
      setSelectedSocio(value);
      setSearchTerm(formatSocioName(value));
    }
  }, [value]);

  // Efecto para cargar socios iniciales cuando se abre por primera vez
  useEffect(() => {
    if (isOpen && socios.length === 0 && !isLoading && !error) {
      fetchSociosRef.current(1, '', true);
    }
  }, [isOpen, socios.length, isLoading, error]);

  // Manejar click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        // Restaurar el valor seleccionado si no se completó la selección
        if (selectedSocio) {
          setSearchTerm(formatSocioName(selectedSocio));
        } else {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedSocio]);

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < socios.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : socios.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && socios[selectedIndex]) {
          handleSelect(socios[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Manejar selección de socio
  const handleSelect = (socio) => {
    setSelectedSocio(socio);
    setSearchTerm(formatSocioName(socio));
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Retornar objeto con la estructura solicitada
    onChange({
      id: socio.id,
      cedula: socio.cedula,
      nombreCompleto: formatSocioName(socio)
    });
  };

  // Manejar cambio en el input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }
    
    // Si se borra el input, limpiar selección
    if (!newValue.trim()) {
      setSelectedSocio(null);
      onChange(null);
    }
  };

  // Manejar click en el input
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} {...props}>
      {/* Input principal */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errorMessage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `socio-option-${selectedIndex}` : undefined}
        />
        
        {/* Icono de dropdown */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden"
          role="listbox"
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {/* Lista de socios */}
            {socios.length > 0 ? (
              <>
                {socios.map((socio, index) => (
                  <div
                    key={socio.id}
                    ref={index === socios.length - 1 ? lastElementRef : null}
                    className={`
                      px-3 py-2 cursor-pointer transition-colors
                      ${selectedIndex === index ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
                    `}
                    onClick={() => handleSelect(socio)}
                    role="option"
                    id={`socio-option-${index}`}
                    aria-selected={selectedIndex === index}
                  >
                    {highlightText(formatSocioName(socio), searchTerm)}
                  </div>
                ))}

                {/* Indicador de carga para infinite scroll - solo cuando hay socios y se está cargando más */}
                {isLoading && socios.length > 0 && (
                  <div className="px-3 py-2 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando más...
                    </div>
                  </div>
                )}

                {/* Botón "Cargar más" si no hay infinite scroll automático */}
                {!isLoading && hasMore && socios.length > 0 && (
                  <div className="px-3 py-2 text-center">
                    <button
                      onClick={loadMore}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Cargar más
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Estados vacíos */
              <div className="px-3 py-4 text-center text-gray-500">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Buscando socios...
                  </div>
                ) : error ? (
                  <div>
                    <p className="text-red-600 mb-2">Error al cargar socios</p>
                    <button
                      onClick={() => fetchSociosRef.current(1, debouncedSearchTerm, true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <p>No se encontraron socios</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default SelectSocio;
