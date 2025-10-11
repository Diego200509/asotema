<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cuenta;

class CuentaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear cuenta de ASOTEMA si no existe
        Cuenta::firstOrCreate(
            [
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
            ],
            [
                'nombre' => 'Cuenta ASOTEMA',
            ]
        );
    }
}

