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
            'correo' => 'admin@asotema.com',
            'password' => '123456', // Contraseña en texto plano para desarrollo
            'rol' => 'ADMIN',
            'activo' => true,
        ]);

        // Crear algunos usuarios de ejemplo
        Usuario::create([
            'nombre' => 'Carlos Martínez',
            'correo' => 'carlos.cajero@asotema.com',
            'password' => '123456',
            'rol' => 'CAJERO',
            'activo' => true,
        ]);

        Usuario::create([
            'nombre' => 'María González',
            'correo' => 'maria.tesorera@asotema.com',
            'password' => '123456',
            'rol' => 'TESORERO',
            'activo' => true,
        ]);
    }
}

