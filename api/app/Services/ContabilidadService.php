<?php

namespace App\Services;

use App\Models\Movimiento;
use App\Models\Cuenta;
use Illuminate\Support\Facades\DB;

class ContabilidadService
{
    /**
     * Registrar un movimiento DEBE
     */
    public function debe(int $cuentaId, float $monto, string $refTipo, ?int $refId, string $descripcion, int $userId): Movimiento
    {
        return Movimiento::create([
            'cuenta_id' => $cuentaId,
            'tipo' => 'DEBE',
            'monto' => $monto,
            'ref_tipo' => $refTipo,
            'ref_id' => $refId,
            'descripcion' => $descripcion,
            'creado_por' => $userId,
        ]);
    }

    /**
     * Registrar un movimiento HABER
     */
    public function haber(int $cuentaId, float $monto, string $refTipo, ?int $refId, string $descripcion, int $userId): Movimiento
    {
        return Movimiento::create([
            'cuenta_id' => $cuentaId,
            'tipo' => 'HABER',
            'monto' => $monto,
            'ref_tipo' => $refTipo,
            'ref_id' => $refId,
            'descripcion' => $descripcion,
            'creado_por' => $userId,
        ]);
    }

    /**
     * Calcular el saldo de una cuenta
     * Fórmula: Saldo = Σ(DEBE) - Σ(HABER)
     */
    public function saldoCuenta(int $cuentaId): float
    {
        $saldo = DB::table('movimientos')
            ->where('cuenta_id', $cuentaId)
            ->selectRaw('
                SUM(CASE WHEN tipo = "DEBE" THEN monto ELSE 0 END) - 
                SUM(CASE WHEN tipo = "HABER" THEN monto ELSE 0 END) as saldo
            ')
            ->value('saldo');

        return (float) $saldo;
    }

    /**
     * Calcular el saldo de una cuenta por tipo de referencia
     */
    public function saldoCuentaPorRefTipo(int $cuentaId, string $refTipo): float
    {
        $saldo = DB::table('movimientos')
            ->where('cuenta_id', $cuentaId)
            ->where('ref_tipo', $refTipo)
            ->selectRaw('
                SUM(CASE WHEN tipo = "DEBE" THEN monto ELSE 0 END) - 
                SUM(CASE WHEN tipo = "HABER" THEN monto ELSE 0 END) as saldo
            ')
            ->value('saldo');

        return (float) $saldo;
    }

    /**
     * Obtener o crear la cuenta de Cartera de ASOTEMA
     */
    public function obtenerCuentaCartera(): Cuenta
    {
        $cuentaCartera = Cuenta::where('propietario_tipo', 'ASOTEMA')
            ->where('propietario_id', null)
            ->where('nombre', 'Cartera de préstamos')
            ->where('tipo', 'INSTITUCIONAL')
            ->first();

        if (!$cuentaCartera) {
            $cuentaCartera = Cuenta::create([
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
                'nombre' => 'Cartera de préstamos',
                'tipo' => 'INSTITUCIONAL',
            ]);
        }

        return $cuentaCartera;
    }

    /**
     * Obtener o crear la cuenta de Intereses de ASOTEMA
     */
    public function obtenerCuentaInteresesAsotema(): Cuenta
    {
        $cuentaIntereses = Cuenta::where('propietario_tipo', 'ASOTEMA')
            ->where('propietario_id', null)
            ->where('nombre', 'Intereses ASOTEMA')
            ->where('tipo', 'INSTITUCIONAL')
            ->first();

        if (!$cuentaIntereses) {
            $cuentaIntereses = Cuenta::create([
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
                'nombre' => 'Intereses ASOTEMA',
                'tipo' => 'INSTITUCIONAL',
            ]);
        }

        return $cuentaIntereses;
    }

    /**
     * Obtener movimientos de una cuenta con filtros opcionales
     */
    public function obtenerMovimientos(int $cuentaId, ?string $refTipo = null, ?int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Movimiento::with(['creadoPor'])
            ->where('cuenta_id', $cuentaId)
            ->orderBy('created_at', 'desc');

        if ($refTipo) {
            $query->where('ref_tipo', $refTipo);
        }

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Obtener resumen de movimientos por cuenta
     */
    public function obtenerResumenCuenta(int $cuentaId): array
    {
        $movimientos = DB::table('movimientos')
            ->where('cuenta_id', $cuentaId)
            ->selectRaw('
                COUNT(*) as total_movimientos,
                SUM(CASE WHEN tipo = "DEBE" THEN monto ELSE 0 END) as total_debe,
                SUM(CASE WHEN tipo = "HABER" THEN monto ELSE 0 END) as total_haber,
                SUM(CASE WHEN tipo = "DEBE" THEN monto ELSE 0 END) - 
                SUM(CASE WHEN tipo = "HABER" THEN monto ELSE 0 END) as saldo_actual
            ')
            ->first();

        return [
            'total_movimientos' => (int) $movimientos->total_movimientos,
            'total_debe' => (float) $movimientos->total_debe,
            'total_haber' => (float) $movimientos->total_haber,
            'saldo_actual' => (float) $movimientos->saldo_actual,
        ];
    }

    /**
     * Registrar asiento contable para préstamo
     */
    public function registrarPrestamo(int $socioId, float $capital, int $prestamoId, int $userId): void
    {
        $cuentaSocio = Cuenta::where('propietario_tipo', 'SOCIO')
            ->where('propietario_id', $socioId)
            ->where('tipo', 'CORRIENTE')
            ->first();

        if (!$cuentaSocio) {
            throw new \Exception("No se encontró la cuenta CORRIENTE del socio ID: {$socioId}");
        }

        // DEBE en cuenta del socio (genera deuda)
        $this->debe(
            $cuentaSocio->id,
            $capital,
            'PRESTAMO',
            $prestamoId,
            "Préstamo por {$capital} - ID: {$prestamoId}",
            $userId
        );

        // HABER en cuenta de Cartera (capital disponible)
        $cuentaCartera = $this->obtenerCuentaCartera();
        $this->haber(
            $cuentaCartera->id,
            $capital,
            'PRESTAMO',
            $prestamoId,
            "Préstamo otorgado por {$capital} - Socio ID: {$socioId}",
            $userId
        );
    }

    /**
     * Registrar asiento contable para pago de cuota
     */
    public function registrarPago(int $socioId, float $montoTotal, float $interes, float $capital, int $prestamoId, int $userId): void
    {
        $cuentaSocio = Cuenta::where('propietario_tipo', 'SOCIO')
            ->where('propietario_id', $socioId)
            ->where('tipo', 'CORRIENTE')
            ->first();

        if (!$cuentaSocio) {
            throw new \Exception("No se encontró la cuenta CORRIENTE del socio ID: {$socioId}");
        }

        // HABER en cuenta del socio (reduce deuda)
        $this->haber(
            $cuentaSocio->id,
            $montoTotal,
            'PAGO',
            $prestamoId,
            "Pago de cuota por {$montoTotal} - Préstamo ID: {$prestamoId}",
            $userId
        );

        // DEBE en cuenta de ASOTEMA por interés (ingreso)
        if ($interes > 0) {
            $cuentaIntereses = $this->obtenerCuentaInteresesAsotema();
            $this->debe(
                $cuentaIntereses->id,
                $interes,
                'PAGO',
                $prestamoId,
                "Interés cobrado por {$interes} - Préstamo ID: {$prestamoId}",
                $userId
            );
        }

        // DEBE en cuenta de Cartera por capital recuperado
        if ($capital > 0) {
            $cuentaCartera = $this->obtenerCuentaCartera();
            $this->debe(
                $cuentaCartera->id,
                $capital,
                'PAGO',
                $prestamoId,
                "Capital recuperado por {$capital} - Préstamo ID: {$prestamoId}",
                $userId
            );
        }
    }
}
