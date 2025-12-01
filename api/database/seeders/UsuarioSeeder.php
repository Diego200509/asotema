<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario ADMIN inicial
        Usuario::create([
            'nombre' => 'Administrador',
            'correo' => 'patriciojijon76@gmail.com',
            'password' => '123456', // Contraseña en texto plano para desarrollo
            'rol' => 'ADMIN',
            'activo' => true,
        ]);
    }
}

