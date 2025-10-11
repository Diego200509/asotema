<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cuenta;

class CuentaInstitucionalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear cuenta institucional de ASOTEMA si no existe
        $cuentaAsotema = Cuenta::where('propietario_tipo', 'ASOTEMA')
                              ->where('propietario_id', null)
                              ->where('nombre', 'Cuenta ASOTEMA')
                              ->first();

        if (!$cuentaAsotema) {
            Cuenta::create([
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
                'nombre' => 'Cuenta ASOTEMA',
                'tipo' => 'INSTITUCIONAL'
            ]);
        }

        // Crear fondo de ahorros ASOTEMA si no existe
        $fondoAhorros = Cuenta::where('propietario_tipo', 'ASOTEMA')
                             ->where('propietario_id', null)
                             ->where('nombre', 'Fondo de Ahorros ASOTEMA')
                             ->first();

        if (!$fondoAhorros) {
            Cuenta::create([
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
                'nombre' => 'Fondo de Ahorros ASOTEMA',
                'tipo' => 'INSTITUCIONAL'
            ]);
        }

        $this->command->info('Cuentas institucionales creadas exitosamente.');
    }
}