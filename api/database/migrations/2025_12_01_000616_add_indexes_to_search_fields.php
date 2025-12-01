<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar índices para búsquedas en la tabla socios
        Schema::table('socios', function (Blueprint $table) {
            // Índice para búsquedas por nombres
            $table->index('nombres', 'idx_socios_nombres');
            // Índice para búsquedas por apellidos
            $table->index('apellidos', 'idx_socios_apellidos');
            // Índice compuesto para búsquedas por nombres y apellidos
            $table->index(['nombres', 'apellidos'], 'idx_socios_nombres_apellidos');
            // Índice para búsquedas por estado
            $table->index('estado', 'idx_socios_estado');
        });

        // Agregar índices para búsquedas en la tabla usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            // Índice para búsquedas por nombre
            $table->index('nombre', 'idx_usuarios_nombre');
            // Índice para búsquedas por rol
            $table->index('rol', 'idx_usuarios_rol');
            // Índice para búsquedas por estado activo
            $table->index('activo', 'idx_usuarios_activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar índices de la tabla socios
        Schema::table('socios', function (Blueprint $table) {
            $table->dropIndex('idx_socios_nombres');
            $table->dropIndex('idx_socios_apellidos');
            $table->dropIndex('idx_socios_nombres_apellidos');
            $table->dropIndex('idx_socios_estado');
        });

        // Eliminar índices de la tabla usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropIndex('idx_usuarios_nombre');
            $table->dropIndex('idx_usuarios_rol');
            $table->dropIndex('idx_usuarios_activo');
        });
    }
};
