<?php

namespace App\Services;

class NumberToWordsService
{
    private static $unidades = [
        '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'
    ];

    private static $decenas = [
        '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
    ];

    private static $especiales = [
        10 => 'diez',
        11 => 'once',
        12 => 'doce',
        13 => 'trece',
        14 => 'catorce',
        15 => 'quince',
        16 => 'dieciséis',
        17 => 'diecisiete',
        18 => 'dieciocho',
        19 => 'diecinueve'
    ];

    private static $centenas = [
        '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
        'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
    ];

    public static function convertir($numero)
    {
        if ($numero == 0) {
            return 'cero';
        }

        $numero = (int) $numero;
        
        if ($numero < 0) {
            return 'menos ' . self::convertir(-$numero);
        }

        if ($numero < 10) {
            return self::$unidades[$numero];
        }

        if ($numero < 20) {
            return self::$especiales[$numero];
        }

        if ($numero < 100) {
            $decena = (int) ($numero / 10);
            $unidad = $numero % 10;
            
            if ($unidad == 0) {
                return self::$decenas[$decena];
            }
            
            if ($decena == 2) {
                return 'veinti' . self::$unidades[$unidad];
            }
            
            return self::$decenas[$decena] . ' y ' . self::$unidades[$unidad];
        }

        if ($numero < 1000) {
            $centena = (int) ($numero / 100);
            $resto = $numero % 100;
            
            if ($resto == 0) {
                return $centena == 1 ? 'cien' : self::$centenas[$centena];
            }
            
            return self::$centenas[$centena] . ' ' . self::convertir($resto);
        }

        if ($numero < 1000000) {
            $miles = (int) ($numero / 1000);
            $resto = $numero % 1000;
            
            $texto = '';
            if ($miles == 1) {
                $texto = 'mil';
            } else {
                $texto = self::convertir($miles) . ' mil';
            }
            
            if ($resto > 0) {
                $texto .= ' ' . self::convertir($resto);
            }
            
            return $texto;
        }

        if ($numero < 1000000000) {
            $millones = (int) ($numero / 1000000);
            $resto = $numero % 1000000;
            
            $texto = '';
            if ($millones == 1) {
                $texto = 'un millón';
            } else {
                $texto = self::convertir($millones) . ' millones';
            }
            
            if ($resto > 0) {
                $texto .= ' ' . self::convertir($resto);
            }
            
            return $texto;
        }

        return 'número muy grande';
    }
}
