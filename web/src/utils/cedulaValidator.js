/**
 * Validador de cédula ecuatoriana con código verificador
 */

export const validateCedulaEcuatoriana = (cedula) => {
  // Limpiar la cédula (solo números)
  const cleanedCedula = cedula.replace(/[^0-9]/g, '');
  
  // Verificar que tenga exactamente 10 dígitos
  if (cleanedCedula.length !== 10) {
    return false;
  }
  
  // Verificar que no sean todos los dígitos iguales
  if (/^(\d)\1{9}$/.test(cleanedCedula)) {
    return false;
  }
  
  // Obtener los primeros 9 dígitos
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitos = cleanedCedula.substring(0, 9).split('').map(Number);
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    
    // Si el producto es mayor a 9, sumar los dígitos del resultado
    if (producto > 9) {
      producto = (producto % 10) + 1;
    }
    
    suma += producto;
  }
  
  // Calcular el dígito verificador
  let digitoVerificador = 10 - (suma % 10);
  if (digitoVerificador === 10) {
    digitoVerificador = 0;
  }
  
  // Comparar con el último dígito de la cédula
  return digitoVerificador === parseInt(cleanedCedula[9]);
};

/**
 * Formatear cédula ecuatoriana (ej: 1234567890 -> 12.345.678-9)
 */
export const formatCedulaEcuatoriana = (cedula) => {
  const cleanedCedula = cedula.replace(/[^0-9]/g, '');
  
  if (cleanedCedula.length === 10) {
    return `${cleanedCedula.substring(0, 2)}.${cleanedCedula.substring(2, 5)}.${cleanedCedula.substring(5, 8)}-${cleanedCedula.substring(9, 10)}`;
  }
  
  return cedula;
};
