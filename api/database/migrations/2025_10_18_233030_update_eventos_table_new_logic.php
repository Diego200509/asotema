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
            // Agregar nuevos campos para la nueva lógica
            $table->decimal('valor_evento', 10, 2)->nullable()->after('monto_ingreso')->comment('Valor total del evento (COMPARTIDO)');
            $table->decimal('aporte_socio', 10, 2)->nullable()->after('valor_evento')->comment('Aporte del socio (COMPARTIDO)');
            $table->decimal('aporte_asotema', 10, 2)->nullable()->after('aporte_socio')->comment('Aporte de ASOTEMA (COMPARTIDO)');
            $table->decimal('costo_por_socio', 10, 2)->nullable()->after('aporte_asotema')->comment('Costo por socio (CUBRE_ASOTEMA)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->dropColumn(['valor_evento', 'aporte_socio', 'aporte_asotema', 'costo_por_socio']);
        });
    }
};
