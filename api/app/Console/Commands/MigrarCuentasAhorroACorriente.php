<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Cuenta;
use App\Models\Movimiento;

class MigrarCuentasAhorroACorriente extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cuentas:migrar-ahorro-a-corriente {--force : Ejecutar sin confirmación}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migra las cuentas de AHORRO a CORRIENTE consolidando todos los movimientos en una sola cuenta por socio';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force')) {
            if (!$this->confirm('¿Estás seguro de que deseas migrar las cuentas de AHORRO a CORRIENTE? Esto consolidará todos los movimientos en la cuenta CORRIENTE de cada socio.')) {
                $this->info('Operación cancelada.');
                return;
            }
        }

        $this->info('Iniciando migración de cuentas de AHORRO a CORRIENTE...');

        try {
            DB::beginTransaction();

            // Obtener todas las cuentas de tipo AHORRO
            $cuentasAhorro = Cuenta::where('propietario_tipo', 'SOCIO')
                                   ->where('tipo', 'AHORRO')
                                   ->get();

            $this->info("Encontradas {$cuentasAhorro->count()} cuentas de AHORRO para migrar.");

            $sociosMigrados = 0;
            $movimientosMigrados = 0;

            foreach ($cuentasAhorro as $cuentaAhorro) {
                $socioId = $cuentaAhorro->propietario_id;

                // Buscar la cuenta CORRIENTE del socio
                $cuentaCorriente = Cuenta::where('propietario_tipo', 'SOCIO')
                                        ->where('propietario_id', $socioId)
                                        ->where('tipo', 'CORRIENTE')
                                        ->first();

                if (!$cuentaCorriente) {
                    $this->warn("No se encontró cuenta CORRIENTE para el socio ID: {$socioId}. Saltando...");
                    continue;
                }

                // Migrar todos los movimientos de la cuenta de AHORRO a la cuenta CORRIENTE
                $movimientos = Movimiento::where('cuenta_id', $cuentaAhorro->id)->get();

                foreach ($movimientos as $movimiento) {
                    $movimiento->update(['cuenta_id' => $cuentaCorriente->id]);
                    $movimientosMigrados++;
                }

                // Eliminar la cuenta de AHORRO
                $cuentaAhorro->delete();
                $sociosMigrados++;

                $this->line("✓ Socio ID {$socioId}: {$movimientos->count()} movimientos migrados.");
            }

            DB::commit();

            $this->info('Migración completada exitosamente.');
            $this->info("Total de socios migrados: {$sociosMigrados}");
            $this->info("Total de movimientos migrados: {$movimientosMigrados}");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error al migrar cuentas: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
