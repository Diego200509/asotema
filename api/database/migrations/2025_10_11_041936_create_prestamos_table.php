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
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('socio_id');
            $table->decimal('capital', 12, 2);
            $table->decimal('tasa_mensual', 6, 4)->default(0.0100); // 1% = 0.0100
            $table->tinyInteger('plazo_meses');
            $table->date('fecha_inicio');
            $table->enum('estado', ['PENDIENTE', 'CANCELADO', 'MORA'])->default('PENDIENTE');
            $table->unsignedBigInteger('creado_por'); // FK usuarios
            $table->timestamps();

            // Foreign keys
            $table->foreign('socio_id')->references('id')->on('socios')->onDelete('cascade');
            $table->foreign('creado_por')->references('id')->on('usuarios')->onDelete('cascade');

            // Índices
            $table->index(['socio_id', 'estado']);
            $table->index('fecha_inicio');
            $table->index('estado');

            // Constraint para plazo válido (comentado por compatibilidad)
            // $table->check('plazo_meses IN (3, 6, 9, 12)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};