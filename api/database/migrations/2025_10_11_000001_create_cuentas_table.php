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
        Schema::create('cuentas', function (Blueprint $table) {
            $table->id();
            $table->enum('propietario_tipo', ['ASOTEMA', 'SOCIO'])->nullable(false);
            $table->unsignedBigInteger('propietario_id')->nullable();
            $table->string('nombre', 120)->nullable(false);
            $table->timestamps();

            // Índice único compuesto: propietario_tipo + propietario_id
            $table->unique(['propietario_tipo', 'propietario_id'], 'unique_propietario');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuentas');
    }
};

