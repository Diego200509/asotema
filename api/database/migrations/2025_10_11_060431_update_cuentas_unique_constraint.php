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
        Schema::table('cuentas', function (Blueprint $table) {
            // Eliminar la restricción única anterior
            $table->dropUnique('unique_propietario');
            
            // Crear nueva restricción única que incluye el tipo
            // Ahora un socio puede tener múltiples tipos de cuentas (CORRIENTE, AHORRO, etc.)
            $table->unique(['propietario_tipo', 'propietario_id', 'tipo'], 'unique_propietario_tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuentas', function (Blueprint $table) {
            // Eliminar la nueva restricción única
            $table->dropUnique('unique_propietario_tipo');
            
            // Restaurar la restricción única anterior
            $table->unique(['propietario_tipo', 'propietario_id'], 'unique_propietario');
        });
    }
};