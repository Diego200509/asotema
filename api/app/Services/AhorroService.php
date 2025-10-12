<?php

namespace App\Services;

use App\Models\Socio;
use App\Models\Cuenta;
use App\Models\AporteAhorro;
use App\Models\Movimiento;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AhorroService
{
    protected $contabilidadService;

    public function __construct(ContabilidadService $contabilidadService)
    {
        $this->contabilidadService = $contabilidadService;
    }

    /**
     * Registrar un depósito de ahorro
     */
    public function registrarDeposito(int $socioId, string $mes, string $fecha, float $monto, int $userId, ?string $notas = null): AporteAhorro
    {
        return DB::transaction(function () use ($socioId, $mes, $fecha, $monto, $userId, $notas) {
            // Validar que el socio existe y está activo
            $socio = Socio::where('id', $socioId)->where('estado', 'ACTIVO')->first();
            if (!$socio) {
                throw new \Exception("El socio no existe o no está activo");
            }

            // Normalizar el mes a día 01
            $mesNormalizado = Carbon::parse($mes)->startOfMonth()->toDateString();

            // Verificar si ya existe un depósito para este socio en este mes
            $existeAporte = AporteAhorro::where('socio_id', $socioId)
                                       ->where('mes', $mesNormalizado)
                                       ->where('tipo', 'DEPOSITO')
                                       ->exists();

            if ($existeAporte) {
                throw new \Exception("Ya existe un depósito para este socio en el mes especificado");
            }

            // Obtener la cuenta CORRIENTE del socio
            $cuentaSocio = $this->obtenerCuentaCorriente($socio);

            // Obtener la cuenta institucional de ahorros
            $cuentaInstitucional = $this->obtenerCuentaFondoAhorros();

            // Crear el aporte
            $aporte = AporteAhorro::create([
                'socio_id' => $socioId,
                'mes' => $mesNormalizado,
                'fecha_operacion' => $fecha,
                'tipo' => 'DEPOSITO',
                'monto' => $monto,
                'notas' => $notas,
                'registrado_por' => $userId,
            ]);

            // Registrar movimientos contables
            $descripcion = "Depósito de ahorro - {$socio->nombres} {$socio->apellidos} - {$mes}";

            // DEBE en cuenta del socio
            $this->contabilidadService->debe(
                $cuentaSocio->id,
                $monto,
                'DEPOSITO_AHORRO',
                $aporte->id,
                $descripcion,
                $userId
            );

            // DEBE en cuenta institucional
            $this->contabilidadService->debe(
                $cuentaInstitucional->id,
                $monto,
                'DEPOSITO_AHORRO',
                $aporte->id,
                $descripcion,
                $userId
            );

            return $aporte;
        });
    }

    /**
     * Registrar un retiro de ahorro
     */
    public function registrarRetiro(int $socioId, string $mes, string $fecha, float $monto, int $userId, ?string $notas = null): AporteAhorro
    {
        return DB::transaction(function () use ($socioId, $mes, $fecha, $monto, $userId, $notas) {
            // Validar que el socio existe y está activo
            $socio = Socio::where('id', $socioId)->where('estado', 'ACTIVO')->first();
            if (!$socio) {
                throw new \Exception("El socio no existe o no está activo");
            }

            // Verificar que el socio tiene saldo suficiente
            $saldoActual = $this->saldoAhorro($socioId);
            if ($saldoActual < $monto) {
                throw new \Exception("El socio no tiene saldo suficiente para realizar el retiro");
            }

            // Normalizar el mes a día 01
            $mesNormalizado = Carbon::parse($mes)->startOfMonth()->toDateString();

            // Obtener la cuenta CORRIENTE del socio
            $cuentaSocio = $this->obtenerCuentaCorriente($socio);
            $cuentaInstitucional = $this->obtenerCuentaFondoAhorros();

            // Crear el aporte
            $aporte = AporteAhorro::create([
                'socio_id' => $socioId,
                'mes' => $mesNormalizado,
                'fecha_operacion' => $fecha,
                'tipo' => 'RETIRO',
                'monto' => $monto,
                'notas' => $notas,
                'registrado_por' => $userId,
            ]);

            // Registrar movimientos contables
            $descripcion = "Retiro de ahorro - {$socio->nombres} {$socio->apellidos} - {$mes}";

            // HABER en cuenta del socio
            $this->contabilidadService->haber(
                $cuentaSocio->id,
                $monto,
                'RETIRO_AHORRO',
                $aporte->id,
                $descripcion,
                $userId
            );

            // HABER en cuenta institucional
            $this->contabilidadService->haber(
                $cuentaInstitucional->id,
                $monto,
                'RETIRO_AHORRO',
                $aporte->id,
                $descripcion,
                $userId
            );

            return $aporte;
        });
    }

    /**
     * Registrar depósitos en lote
     */
    public function registrarDepositoLote(array $socioIds, string $mes, string $fecha, float $monto, int $userId): array
    {
        $resultados = [
            'exitosos' => [],
            'errores' => []
        ];

        foreach ($socioIds as $socioId) {
            try {
                $aporte = $this->registrarDeposito($socioId, $mes, $fecha, $monto, $userId);
                $resultados['exitosos'][] = [
                    'socio_id' => $socioId,
                    'aporte_id' => $aporte->id
                ];
            } catch (\Exception $e) {
                $resultados['errores'][] = [
                    'socio_id' => $socioId,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $resultados;
    }

    /**
     * Obtener saldo de ahorro de un socio (solo ahorros, no préstamos)
     */
    public function saldoAhorro(int $socioId): float
    {
        // Calcular solo los ahorros (depósitos - retiros)
        $totalDepositos = AporteAhorro::where('socio_id', $socioId)
                                     ->where('tipo', 'DEPOSITO')
                                     ->sum('monto');

        $totalRetiros = AporteAhorro::where('socio_id', $socioId)
                                   ->where('tipo', 'RETIRO')
                                   ->sum('monto');

        return (float) $totalDepositos - (float) $totalRetiros;
    }

    /**
     * Obtener resumen de ahorros de un socio
     */
    public function obtenerResumenSocio(int $socioId): array
    {
        $socio = Socio::find($socioId);
        if (!$socio) {
            throw new \Exception("El socio no existe");
        }

        $saldoActual = $this->saldoAhorro($socioId);

        // Total de depósitos y retiros
        $totalDepositos = AporteAhorro::where('socio_id', $socioId)
                                     ->where('tipo', 'DEPOSITO')
                                     ->sum('monto');

        $totalRetiros = AporteAhorro::where('socio_id', $socioId)
                                   ->where('tipo', 'RETIRO')
                                   ->sum('monto');

        // Total de aportes
        $totalAportes = AporteAhorro::where('socio_id', $socioId)->count();

        // Último aporte
        $ultimoAporte = AporteAhorro::where('socio_id', $socioId)
                                   ->orderBy('fecha_operacion', 'desc')
                                   ->first();

        // Histórico por mes
        $historicoPorMes = AporteAhorro::where('socio_id', $socioId)
                                      ->selectRaw('mes, 
                                                  SUM(CASE WHEN tipo = "DEPOSITO" THEN monto ELSE 0 END) as depositos,
                                                  SUM(CASE WHEN tipo = "RETIRO" THEN monto ELSE 0 END) as retiros')
                                      ->groupBy('mes')
                                      ->orderBy('mes')
                                      ->get()
                                      ->map(function ($item) {
                                          return [
                                              'mes' => $item->mes,
                                              'depositos' => (float) $item->depositos,
                                              'retiros' => (float) $item->retiros,
                                              'saldo_mes' => (float) $item->depositos - (float) $item->retiros
                                          ];
                                      });

        return [
            'socio' => [
                'id' => $socio->id,
                'nombres' => $socio->nombres,
                'apellidos' => $socio->apellidos,
                'cedula' => $socio->cedula
            ],
            'saldo_actual' => $saldoActual,
            'total_depositos' => (float) $totalDepositos,
            'total_retiros' => (float) $totalRetiros,
            'total_aportes' => $totalAportes,
            'ultimo_aporte' => $ultimoAporte ? \Carbon\Carbon::parse($ultimoAporte->fecha_operacion . 'T00:00:00-05:00')->format('Y-m-d') : null,
            'historico_por_mes' => $historicoPorMes
        ];
    }

    /**
     * Eliminar un aporte y revertir movimientos contables
     */
    public function eliminarAporte(int $aporteId, int $userId): bool
    {
        return DB::transaction(function () use ($aporteId, $userId) {
            $aporte = AporteAhorro::find($aporteId);
            if (!$aporte) {
                throw new \Exception("El aporte no existe");
            }

            // Obtener la cuenta CORRIENTE del socio
            $cuentaSocio = Cuenta::where('propietario_tipo', 'SOCIO')
                                 ->where('propietario_id', $aporte->socio_id)
                                 ->where('tipo', 'CORRIENTE')
                                 ->first();

            $cuentaInstitucional = $this->obtenerCuentaFondoAhorros();

            // Revertir movimientos contables
            $descripcion = "Reversión de {$aporte->tipo} de ahorro - ID: {$aporte->id}";

            if ($aporte->tipo === 'DEPOSITO') {
                // Revertir: HABER en cuenta del socio, HABER en cuenta institucional
                $this->contabilidadService->haber(
                    $cuentaSocio->id,
                    $aporte->monto,
                    'REVERSION_DEPOSITO_AHORRO',
                    $aporte->id,
                    $descripcion,
                    $userId
                );

                $this->contabilidadService->haber(
                    $cuentaInstitucional->id,
                    $aporte->monto,
                    'REVERSION_DEPOSITO_AHORRO',
                    $aporte->id,
                    $descripcion,
                    $userId
                );
            } else {
                // Revertir: DEBE en cuenta del socio, DEBE en cuenta institucional
                $this->contabilidadService->debe(
                    $cuentaSocio->id,
                    $aporte->monto,
                    'REVERSION_RETIRO_AHORRO',
                    $aporte->id,
                    $descripcion,
                    $userId
                );

                $this->contabilidadService->debe(
                    $cuentaInstitucional->id,
                    $aporte->monto,
                    'REVERSION_RETIRO_AHORRO',
                    $aporte->id,
                    $descripcion,
                    $userId
                );
            }

            // Eliminar el aporte (soft delete)
            $aporte->delete();

            return true;
        });
    }

    /**
     * Obtener la cuenta CORRIENTE de un socio
     */
    protected function obtenerCuentaCorriente(Socio $socio): Cuenta
    {
        // Buscar cuenta CORRIENTE existente
        $cuenta = Cuenta::where('propietario_tipo', 'SOCIO')
                        ->where('propietario_id', $socio->id)
                        ->where('tipo', 'CORRIENTE')
                        ->first();

        if (!$cuenta) {
            throw new \Exception("No se encontró la cuenta CORRIENTE del socio {$socio->id}. La cuenta debe crearse al registrar el socio.");
        }

        return $cuenta;
    }

    /**
     * Obtener la cuenta institucional de fondo de ahorros
     */
    protected function obtenerCuentaFondoAhorros(): Cuenta
    {
        $cuenta = Cuenta::fondoAhorros()->first();

        if (!$cuenta) {
            try {
                $cuenta = Cuenta::create([
                    'propietario_tipo' => 'ASOTEMA',
                    'propietario_id' => null,
                    'nombre' => 'Fondo de Ahorros ASOTEMA',
                    'tipo' => 'INSTITUCIONAL'
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                // Si falla por restricción única, buscar la cuenta nuevamente
                if ($e->getCode() == 23000) { // Integrity constraint violation
                    $cuenta = Cuenta::fondoAhorros()->first();
                    
                    if (!$cuenta) {
                        throw new \Exception("Error al crear cuenta institucional de fondo de ahorros: " . $e->getMessage());
                    }
                } else {
                    throw $e;
                }
            }
        }

        return $cuenta;
    }
}
