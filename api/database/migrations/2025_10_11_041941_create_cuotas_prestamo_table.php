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
        Schema::create('cuotas_prestamo', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prestamo_id');
            $table->smallInteger('numero_cuota');
            $table->date('fecha_vencimiento');
            $table->decimal('monto_esperado', 12, 2);
            $table->decimal('parte_interes', 12, 2);
            $table->decimal('parte_capital', 12, 2);
            $table->decimal('monto_pagado', 12, 2)->default(0);
            $table->dateTime('pagada_en')->nullable();
            $table->enum('estado', ['PENDIENTE', 'PAGADA', 'PARCIAL'])->default('PENDIENTE');
            $table->timestamps();

            // Foreign keys
            $table->foreign('prestamo_id')->references('id')->on('prestamos')->onDelete('cascade');

            // Índices
            $table->index(['prestamo_id', 'numero_cuota']);
            $table->index(['prestamo_id', 'estado']);
            $table->index('fecha_vencimiento');

            // Constraint único para prestamo_id + numero_cuota
            $table->unique(['prestamo_id', 'numero_cuota']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuotas_prestamo');
    }
};