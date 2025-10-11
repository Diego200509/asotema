import React from 'react';

const MoneyInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = "0.00", 
  min = 0, 
  max = 10000, 
  step = 0.01,
  required = false,
  disabled = false,
  error = null,
  className = ""
}) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Permitir solo números y un punto decimal
    if (inputValue === '' || /^\d*\.?\d{0,2}$/.test(inputValue)) {
      onChange(e);
    }
  };

  const formatValue = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    return parseFloat(val).toFixed(2);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">$</span>
        </div>
        
        <input
          type="text"
          name={name}
          value={formatValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          className={`
            block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm
            focus:ring-2 focus:ring-green-500 focus:border-green-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300' 
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MoneyInput;
