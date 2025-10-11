/**
 * Utilidades para manejo de fechas en zona horaria de Ecuador
 */

/**
 * Obtiene la fecha actual en zona horaria de Ecuador (America/Guayaquil)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getCurrentDateInEcuador = () => {
  const now = new Date();
  
  // Convertir a zona horaria de Ecuador (UTC-5)
  const ecuadorTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Guayaquil"}));
  
  // Formatear como YYYY-MM-DD
  const year = ecuadorTime.getFullYear();
  const month = String(ecuadorTime.getMonth() + 1).padStart(2, '0');
  const day = String(ecuadorTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para mostrar en zona horaria de Ecuador
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @param {number} monthsToAdd - Meses a agregar (opcional)
 * @returns {string} Fecha formateada para Ecuador
 */
export const formatDateForEcuador = (dateString, monthsToAdd = 0) => {
  const date = new Date(dateString + 'T00:00:00-05:00'); // UTC-5 (Ecuador)
  
  if (monthsToAdd > 0) {
    date.setMonth(date.getMonth() + monthsToAdd);
  }
  
  return date.toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Obtiene la fecha actual formateada para Ecuador
 * @returns {string} Fecha actual en formato DD/MM/YYYY
 */
export const getCurrentDateFormatted = () => {
  const now = new Date();
  return now.toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
