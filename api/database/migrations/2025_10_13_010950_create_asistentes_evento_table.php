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
        Schema::create('asistentes_evento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')->constrained('eventos')->onDelete('cascade');
            $table->foreignId('socio_id')->constrained('socios')->onDelete('cascade');
            $table->boolean('asistio')->default(true);
            $table->timestamps();
            
            // Restricción única: un socio no puede estar duplicado en el mismo evento
            $table->unique(['evento_id', 'socio_id']);
            
            // Índices para optimización
            $table->index(['evento_id']);
            $table->index(['socio_id']);
            $table->index(['asistio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistentes_evento');
    }
};