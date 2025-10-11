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
        Schema::table('socios', function (Blueprint $table) {
            // Hacer teléfono obligatorio
            $table->string('telefono')->nullable(false)->change();
            
            // Hacer correo obligatorio
            $table->string('correo')->nullable(false)->change();
            
            // Hacer fecha_ingreso obligatoria
            $table->dateTime('fecha_ingreso')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('socios', function (Blueprint $table) {
            // Revertir cambios
            $table->string('telefono')->nullable()->change();
            $table->string('correo')->nullable()->change();
            $table->dateTime('fecha_ingreso')->nullable()->change();
        });
    }
};