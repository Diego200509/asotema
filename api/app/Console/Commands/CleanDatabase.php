<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:clean {--force : Ejecutar sin confirmación}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia la base de datos dejando solo el usuario admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force')) {
            if (!$this->confirm('¿Estás seguro de que deseas limpiar la base de datos? Esto eliminará todos los datos excepto el usuario admin.')) {
                $this->info('Operación cancelada.');
                return;
            }
        }

        $this->info('Iniciando limpieza de base de datos...');

        try {
            DB::beginTransaction();

            // Deshabilitar las restricciones de clave foránea temporalmente (solo MySQL)
            $driver = DB::getDriverName();
            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            } else {
                DB::statement('PRAGMA foreign_keys = OFF;');
            }

            // Limpiar tablas en orden correcto (de dependientes a independientes)
            $this->info('Limpiando cuotas de préstamos...');
            DB::table('cuotas_prestamo')->delete();

            $this->info('Limpiando aportes de ahorro...');
            DB::table('aportes_ahorro')->delete();

            $this->info('Limpiando préstamos...');
            DB::table('prestamos')->delete();

            $this->info('Limpiando movimientos contables...');
            DB::table('movimientos')->delete();

            $this->info('Limpiando cuentas...');
            DB::table('cuentas')->delete();

            $this->info('Limpiando socios...');
            DB::table('socios')->delete();

            $this->info('Limpiando usuarios (excepto admin)...');
            DB::table('usuarios')->where('correo', '!=', 'admin@asotema.com')->delete();

            // Asegurarse de que el usuario admin exista y esté correcto
            $adminExists = DB::table('usuarios')->where('correo', 'admin@asotema.com')->exists();
            
            if (!$adminExists) {
                $this->info('Creando usuario admin...');
                DB::table('usuarios')->insert([
                    'nombre' => 'Administrador',
                    'correo' => 'admin@asotema.com',
                    'password' => 'admin123',
                    'rol' => 'ADMIN',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $this->info('Usuario admin ya existe. Actualizando contraseña...');
                DB::table('usuarios')
                    ->where('correo', 'admin@asotema.com')
                    ->update([
                        'password' => 'admin123',
                        'nombre' => 'Administrador',
                        'updated_at' => now(),
                    ]);
            }

            // Limpiar cache y jobs (si existen)
            $this->info('Limpiando cache y trabajos...');
            $tables = ['cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs'];
            foreach ($tables as $table) {
                if (DB::getSchemaBuilder()->hasTable($table)) {
                    DB::table($table)->delete();
                }
            }

            // Restaurar las restricciones de clave foránea
            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            } else {
                DB::statement('PRAGMA foreign_keys = ON;');
            }

            DB::commit();

            $this->info('Base de datos limpiada exitosamente.');
            $this->info('Usuario admin disponible:');
            $this->line('  Correo: admin@asotema.com');
            $this->line('  Contraseña: admin123');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Restaurar las restricciones de clave foránea en caso de error
            try {
                $driver = DB::getDriverName();
                if ($driver === 'mysql') {
                    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                } else {
                    DB::statement('PRAGMA foreign_keys = ON;');
                }
            } catch (\Exception $e2) {
                // Ignorar errores al restaurar restricciones
            }
            
            $this->error('Error al limpiar la base de datos: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
