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
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cuenta_id');
            $table->enum('tipo', ['DEBE', 'HABER']);
            $table->decimal('monto', 12, 2);
            $table->string('ref_tipo', 40); // 'PRESTAMO', 'PAGO', etc.
            $table->unsignedBigInteger('ref_id')->nullable();
            $table->string('descripcion', 255);
            $table->unsignedBigInteger('creado_por'); // FK usuarios
            $table->timestamps();

            // Foreign keys
            $table->foreign('cuenta_id')->references('id')->on('cuentas')->onDelete('cascade');
            $table->foreign('creado_por')->references('id')->on('usuarios')->onDelete('cascade');

            // Índices
            $table->index(['cuenta_id', 'tipo']);
            $table->index(['ref_tipo', 'ref_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};