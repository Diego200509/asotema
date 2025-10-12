/**
 * Utilidades para manejo de fechas con zona horaria de Ecuador
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria de Ecuador
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getCurrentDateEcuador = () => {
  const now = new Date();
  
  // Usar toLocaleDateString con zona horaria de Ecuador
  const ecuadorDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Guayaquil"}));
  
  // Formatear a YYYY-MM-DD
  const year = ecuadorDate.getFullYear();
  const month = String(ecuadorDate.getMonth() + 1).padStart(2, '0');
  const day = String(ecuadorDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para mostrar en el input type="date"
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha para Ecuador agregando meses
 * @param {string} dateString - Fecha base en formato YYYY-MM-DD
 * @param {number} monthsToAdd - Número de meses a agregar
 * @returns {string} Fecha formateada en formato DD/MM/YYYY
 */
export const formatDateForEcuador = (dateString, monthsToAdd = 0) => {
  if (!dateString) return '';
  
  // Si ya es una fecha en formato ISO o tiene formato completo, usarla directamente
  let ecuadorDate;
  if (dateString.includes('T') || dateString.includes(' ')) {
    // Es una fecha completa con hora
    ecuadorDate = new Date(dateString);
  } else {
    // Es solo fecha (YYYY-MM-DD), agregar zona horaria de Ecuador
    ecuadorDate = new Date(dateString + 'T00:00:00-05:00');
  }
  
  if (isNaN(ecuadorDate.getTime())) return '';
  
  // Agregar meses si es necesario
  if (monthsToAdd > 0) {
    ecuadorDate.setMonth(ecuadorDate.getMonth() + monthsToAdd);
  }
  
  // Formatear para Ecuador (DD/MM/YYYY)
  const day = String(ecuadorDate.getDate()).padStart(2, '0');
  const month = String(ecuadorDate.getMonth() + 1).padStart(2, '0');
  const year = ecuadorDate.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Valida si una fecha es válida para fecha de ingreso (hasta hoy en Ecuador)
 * @param {string} date - Fecha a validar en formato YYYY-MM-DD
 * @returns {boolean} true si la fecha es válida
 */
export const isValidIngresoDate = (date) => {
  if (!date) return false;
  
  const inputDate = new Date(date);
  const todayEcuador = new Date(getCurrentDateEcuador());
  
  return inputDate <= todayEcuador;
};