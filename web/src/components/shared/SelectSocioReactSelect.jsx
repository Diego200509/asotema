import React from 'react';
import AsyncSelect from 'react-select/async';
import axios from '../../config/axios';

/**
 * Componente SelectSocio usando react-select/AsyncSelect
 * Alternativa más avanzada con mejor UX
 * 
 * Requiere: npm install react-select
 */
const SelectSocioReactSelect = ({
  value = null,
  onChange,
  placeholder = "Buscar por nombre o cédula...",
  className = "",
  disabled = false,
  error = null,
  ...props
}) => {
  // Función para cargar socios desde la API
  const loadSocios = async (inputValue, callback) => {
    try {
      const response = await axios.get('/socios', {
        params: {
          per_page: 20,
          page: 1,
          q: inputValue || ''
        }
      });

      const socios = response.data.data || [];
      const options = socios.map(socio => ({
        value: {
          id: socio.id,
          cedula: socio.cedula,
          nombreCompleto: `${socio.nombres} ${socio.apellidos} — (${socio.cedula})`
        },
        label: `${socio.nombres} ${socio.apellidos} — (${socio.cedula})`
      }));

      callback(options);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      callback([]);
    }
  };

  // Función para resaltar texto
  const formatOptionLabel = (option, { inputValue }) => {
    if (!inputValue) return option.label;
    
    const regex = new RegExp(`(${inputValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = option.label.split(regex);
    
    return (
      <div>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 px-1 rounded">
              {part}
            </mark>
          ) : part
        )}
      </div>
    );
  };

  const handleChange = (selectedOption) => {
    onChange(selectedOption ? selectedOption.value : null);
  };

  const selectedOption = value ? {
    value: value,
    label: value.nombreCompleto
  } : null;

  return (
    <div className={className}>
      <AsyncSelect
        value={selectedOption}
        onChange={handleChange}
        loadOptions={loadSocios}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        isSearchable
        defaultOptions
        loadingMessage={() => "Buscando socios..."}
        noOptionsMessage={() => "No se encontraron socios"}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': {
              borderColor: error ? '#ef4444' : '#9ca3af'
            }
          }),
          menu: (base) => ({
            ...base,
            maxHeight: '240px'
          }),
          menuList: (base) => ({
            ...base,
            maxHeight: '240px'
          })
        }}
        {...props}
      />
      
      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SelectSocioReactSelect;
