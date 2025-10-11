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
        Schema::create('aportes_ahorro', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('socio_id');
            $table->date('mes'); // Normalizado a día 01 (YYYY-MM-01)
            $table->date('fecha_operacion');
            $table->enum('tipo', ['DEPOSITO', 'RETIRO'])->default('DEPOSITO');
            $table->decimal('monto', 12, 2);
            $table->string('notas', 255)->nullable();
            $table->unsignedBigInteger('registrado_por'); // FK usuarios
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('socio_id')->references('id')->on('socios')->onDelete('cascade');
            $table->foreign('registrado_por')->references('id')->on('usuarios')->onDelete('cascade');

            // Índices
            $table->index(['socio_id', 'mes']);
            $table->index(['mes', 'tipo']);
            $table->index('fecha_operacion');
            
            // Índice único para evitar duplicados socio+mes+tipo (opcional)
            $table->unique(['socio_id', 'mes', 'tipo'], 'unique_socio_mes_tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aportes_ahorro');
    }
};