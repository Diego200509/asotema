<?php

namespace App\Helpers;

class CedulaValidator
{
    /**
     * Validar cédula ecuatoriana con código verificador
     * 
     * @param string $cedula
     * @return bool
     */
    public static function validate($cedula)
    {
        // Limpiar la cédula (solo números)
        $cedula = preg_replace('/[^0-9]/', '', $cedula);
        
        // Verificar que tenga exactamente 10 dígitos
        if (strlen($cedula) !== 10) {
            return false;
        }
        
        // Verificar que no sean todos los dígitos iguales
        if (preg_match('/(\d)\1{9}/', $cedula)) {
            return false;
        }
        
        // Obtener los primeros 9 dígitos
        $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $digitos = str_split(substr($cedula, 0, 9));
        $suma = 0;
        
        for ($i = 0; $i < 9; $i++) {
            $producto = $digitos[$i] * $coeficientes[$i];
            
            // Si el producto es mayor a 9, sumar los dígitos del resultado
            if ($producto > 9) {
                $producto = ($producto % 10) + 1;
            }
            
            $suma += $producto;
        }
        
        // Calcular el dígito verificador
        $digitoVerificador = 10 - ($suma % 10);
        if ($digitoVerificador == 10) {
            $digitoVerificador = 0;
        }
        
        // Comparar con el último dígito de la cédula
        return $digitoVerificador == $cedula[9];
    }
    
    /**
     * Formatear cédula ecuatoriana (ej: 1234567890 -> 12.345.678-9)
     * 
     * @param string $cedula
     * @return string
     */
    public static function format($cedula)
    {
        $cedula = preg_replace('/[^0-9]/', '', $cedula);
        
        if (strlen($cedula) === 10) {
            return substr($cedula, 0, 2) . '.' . 
                   substr($cedula, 2, 3) . '.' . 
                   substr($cedula, 5, 3) . '-' . 
                   substr($cedula, 9, 1);
        }
        
        return $cedula;
    }
}
