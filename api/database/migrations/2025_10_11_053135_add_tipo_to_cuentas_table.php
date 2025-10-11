<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cuentas', function (Blueprint $table) {
            $table->enum('tipo', ['CORRIENTE', 'AHORRO', 'INSTITUCIONAL'])->default('CORRIENTE')->after('nombre');
        });

        // Actualizar cuentas existentes
        DB::table('cuentas')
            ->where('propietario_tipo', 'ASOTEMA')
            ->where('propietario_id', null)
            ->update(['tipo' => 'INSTITUCIONAL']);

        DB::table('cuentas')
            ->where('propietario_tipo', 'SOCIO')
            ->update(['tipo' => 'CORRIENTE']);

        // Crear cuenta institucional de ahorros si no existe
        $existeFondoAhorros = DB::table('cuentas')
            ->where('propietario_tipo', 'ASOTEMA')
            ->where('propietario_id', null)
            ->where('nombre', 'Fondo de Ahorros ASOTEMA')
            ->exists();

        if (!$existeFondoAhorros) {
            DB::table('cuentas')->insert([
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
                'nombre' => 'Fondo de Ahorros ASOTEMA',
                'tipo' => 'INSTITUCIONAL',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuentas', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};