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
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('motivo');
            $table->dateTime('fecha_evento'); // Incluye fecha y hora para Ecuador
            $table->enum('tipo_evento', ['COMPARTIDO', 'CUBRE_ASOTEMA']);
            $table->decimal('precio_por_asistente', 10, 2);
            $table->decimal('costo_por_asistente', 10, 2);
            $table->boolean('contabilizado')->default(false);
            $table->foreignId('creado_por')->constrained('usuarios');
            $table->timestamps();
            $table->softDeletes();
            
            // Índices para optimización
            $table->index(['fecha_evento']);
            $table->index(['tipo_evento']);
            $table->index(['contabilizado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};