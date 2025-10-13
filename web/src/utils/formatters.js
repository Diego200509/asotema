/**
 * Utilidades para formatear valores
 */

/**
 * Formatea un número como moneda en dólares
 * @param {number|string} value - Valor a formatear
 * @returns {string} Valor formateado como moneda (ej: $1,234.56)
 */
export const formatCurrency = (value) => {
  // Manejar valores null, undefined o vacíos
  if (value === null || value === undefined || value === '') {
    return '$0.00';
  }

  // Convertir a número
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Verificar si es un número válido
  if (isNaN(numValue)) {
    return '$0.00';
  }

  // Formatear como moneda USD
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Formatea un número como porcentaje
 * @param {number|string} value - Valor a formatear (ej: 0.15 para 15%)
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} Valor formateado como porcentaje (ej: 15.00%)
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return '0.00%';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0.00%';
  }

  return `${(numValue * 100).toFixed(decimals)}%`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number|string} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {string} Valor formateado (ej: 1,234.56)
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};
