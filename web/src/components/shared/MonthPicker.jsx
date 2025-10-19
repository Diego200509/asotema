import React from 'react';

const MonthPicker = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  error = null,
  maxMonth = null,
  className = ""
}) => {
  // Generar opciones de meses (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Nombres de meses en español
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthYear = `${year}-${month}`;
      
      // Verificar si no excede el mes máximo
      if (!maxMonth || monthYear <= maxMonth) {
        const monthName = monthNames[date.getMonth()];
        const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
        
        options.push({
          value: monthYear,
          label: label
        });
      }
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:ring-2 focus:ring-green-500 focus:border-green-500
          ${error 
            ? 'border-red-300 text-red-900' 
            : 'border-gray-300 text-gray-900'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <option value="">Seleccionar mes</option>
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MonthPicker;
