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
        Schema::table('eventos', function (Blueprint $table) {
            $table->decimal('precio_por_asistente', 10, 2)->nullable()->change();
            $table->decimal('costo_por_asistente', 10, 2)->nullable()->change();
            $table->enum('tipo_evento', ['COMPARTIDO', 'CUBRE_ASOTEMA'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->decimal('precio_por_asistente', 10, 2)->nullable(false)->change();
            $table->decimal('costo_por_asistente', 10, 2)->nullable(false)->change();
            $table->enum('tipo_evento', ['COMPARTIDO', 'CUBRE_ASOTEMA'])->nullable(false)->change();
        });
    }
};
