<?php

namespace App\Services;

use App\Models\Prestamo;
use App\Models\CuotaPrestamo;
use App\Models\Socio;
use App\Services\ContabilidadService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PrestamoService
{
    protected $contabilidadService;

    public function __construct(ContabilidadService $contabilidadService)
    {
        $this->contabilidadService = $contabilidadService;
    }

    /**
     * Crear un préstamo con su cronograma de cuotas
     */
    public function crearPrestamo(int $socioId, float $capital, int $plazo, ?string $fechaInicio = null, float $tasa = 0.01): Prestamo
    {
        return DB::transaction(function () use ($socioId, $capital, $plazo, $fechaInicio, $tasa) {
            // Validar que el socio existe y está activo
            $socio = Socio::where('id', $socioId)->where('estado', 'ACTIVO')->first();
            if (!$socio) {
                throw new \Exception("El socio no existe o no está activo");
            }

            // Si no se proporciona fecha de inicio, usar la fecha actual en Ecuador
            $fechaInicioFinal = $fechaInicio ?: now('America/Guayaquil')->toDateString();

            // Crear el préstamo
            $prestamo = Prestamo::create([
                'socio_id' => $socioId,
                'capital' => $capital,
                'tasa_mensual' => $tasa,
                'plazo_meses' => $plazo,
                'fecha_inicio' => $fechaInicioFinal,
                'estado' => 'PENDIENTE',
                'creado_por' => auth()->id(),
            ]);

            // Generar cronograma de cuotas
            $this->generarCronograma($prestamo);

            // Registrar asiento contable
            $this->contabilidadService->registrarPrestamo($socioId, $capital, $prestamo->id, auth()->id());

            return $prestamo->load(['socio', 'cuotas']);
        });
    }

    /**
     * Generar cronograma de cuotas con interés fijo
     * Interés fijo del 1% sobre el capital total en cada cuota
     */
    protected function generarCronograma(Prestamo $prestamo): void
    {
        $capital = $prestamo->capital;
        $tasa = $prestamo->tasa_mensual;
        $plazo = $prestamo->plazo_meses;
        $fechaInicio = Carbon::createFromFormat('Y-m-d', $prestamo->fecha_inicio, 'America/Guayaquil');

        // Interés fijo del 1% sobre el capital total
        $interesFijo = $capital * $tasa;
        
        // Capital dividido en partes iguales
        $capitalPorCuota = $capital / $plazo;
        
        // Cuota fija = Capital + Interés fijo
        $cuotaFija = $capitalPorCuota + $interesFijo;

        // Saldo pendiente para cálculos
        $saldoPendiente = $capital;

        for ($i = 1; $i <= $plazo; $i++) {
            // Para la última cuota, ajustar el capital para que no quede saldo
            $capitalCuota = $capitalPorCuota;
            if ($i == $plazo) {
                $capitalCuota = $saldoPendiente;
            }

            // Fecha de vencimiento (mes siguiente)
            $fechaVencimiento = $fechaInicio->copy()->addMonths($i);

            // Crear cuota
            CuotaPrestamo::create([
                'prestamo_id' => $prestamo->id,
                'numero_cuota' => $i,
                'fecha_vencimiento' => $fechaVencimiento,
                'monto_esperado' => $cuotaFija,
                'parte_interes' => $interesFijo, // Interés fijo en todas las cuotas
                'parte_capital' => $capitalCuota,
                'monto_pagado' => 0,
                'estado' => 'PENDIENTE',
            ]);

            // Actualizar saldo pendiente
            $saldoPendiente -= $capitalCuota;
        }
    }

    /**
     * Calcular cuota fija usando la fórmula de anualidad
     */
    protected function calcularCuotaFija(float $capital, float $tasa, int $plazo): float
    {
        if ($tasa == 0) {
            return $capital / $plazo;
        }

        $factor = pow(1 + $tasa, $plazo);
        return $capital * ($tasa * $factor) / ($factor - 1);
    }

    /**
     * Pagar una cuota específica
     */
    public function pagarCuota(int $prestamoId, int $numeroCuota, float $monto, int $cobradorUserId): array
    {
        return DB::transaction(function () use ($prestamoId, $numeroCuota, $monto, $cobradorUserId) {
            $prestamo = Prestamo::with(['socio', 'cuotas'])->findOrFail($prestamoId);
            $cuota = $prestamo->cuotas()->where('numero_cuota', $numeroCuota)->first();

            if (!$cuota) {
                throw new \Exception("La cuota {$numeroCuota} no existe para este préstamo");
            }

            $resultado = [
                'cuota_pagada' => $cuota,
                'pagos_aplicados' => [],
                'monto_total_aplicado' => 0,
                'interes_cobrado' => 0,
                'capital_recuperado' => 0,
            ];

            $montoRestante = $monto;

            // Aplicar pago a la cuota especificada y siguientes si sobra
            $cuotasParaPagar = $prestamo->cuotas()
                ->where('numero_cuota', '>=', $numeroCuota)
                ->where('estado', '!=', 'PAGADA')
                ->orderBy('numero_cuota')
                ->get();

            foreach ($cuotasParaPagar as $cuotaActual) {
                if ($montoRestante <= 0) {
                    break;
                }

                $montoPendiente = $cuotaActual->monto_esperado - $cuotaActual->monto_pagado;
                $montoAplicar = min($montoRestante, $montoPendiente);

                if ($montoAplicar > 0) {
                    // Calcular distribución del pago
                    $distribucion = $this->distribuirPago($cuotaActual, $montoAplicar);

                    // Actualizar cuota
                    $cuotaActual->monto_pagado += $montoAplicar;
                    $cuotaActual->estado = $this->calcularEstadoCuota($cuotaActual);

                    if ($cuotaActual->completamente_pagada) {
                        $cuotaActual->pagada_en = now();
                    }

                    $cuotaActual->save();

                    // Registrar movimientos contables
                    $this->contabilidadService->registrarPago(
                        $prestamo->socio_id,
                        $montoAplicar,
                        $distribucion['interes'],
                        $distribucion['capital'],
                        $prestamo->id,
                        $cobradorUserId
                    );

                    $resultado['pagos_aplicados'][] = [
                        'numero_cuota' => $cuotaActual->numero_cuota,
                        'monto_aplicado' => $montoAplicar,
                        'interes' => $distribucion['interes'],
                        'capital' => $distribucion['capital'],
                        'nuevo_estado' => $cuotaActual->estado,
                    ];

                    $resultado['monto_total_aplicado'] += $montoAplicar;
                    $resultado['interes_cobrado'] += $distribucion['interes'];
                    $resultado['capital_recuperado'] += $distribucion['capital'];

                    $montoRestante -= $montoAplicar;
                }
            }

            // Verificar si el préstamo está completamente pagado
            if ($prestamo->completamente_pagado) {
                $prestamo->estado = 'CANCELADO';
                $prestamo->save();
            }

            // Recargar préstamo con datos actualizados
            $resultado['prestamo'] = $prestamo->fresh(['socio', 'cuotas']);

            return $resultado;
        });
    }

    /**
     * Distribuir el pago entre interés y capital
     * Primero se paga el interés, luego el capital
     */
    protected function distribuirPago(CuotaPrestamo $cuota, float $monto): array
    {
        $interesPendiente = $cuota->parte_interes - ($cuota->monto_pagado * ($cuota->parte_interes / $cuota->monto_esperado));
        $capitalPendiente = $cuota->parte_capital - ($cuota->monto_pagado * ($cuota->parte_capital / $cuota->monto_esperado));

        $interesAPagar = min($monto, $interesPendiente);
        $capitalAPagar = $monto - $interesAPagar;

        return [
            'interes' => $interesAPagar,
            'capital' => $capitalAPagar,
        ];
    }

    /**
     * Calcular el estado de la cuota
     */
    protected function calcularEstadoCuota(CuotaPrestamo $cuota): string
    {
        if ($cuota->monto_pagado >= $cuota->monto_esperado) {
            return 'PAGADA';
        } elseif ($cuota->monto_pagado > 0) {
            return 'PARCIAL';
        } else {
            return 'PENDIENTE';
        }
    }

    /**
     * Obtener préstamos con filtros
     */
    public function obtenerPrestamos(array $filtros = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = Prestamo::with(['socio', 'creadoPor', 'cuotas']);

        if (isset($filtros['socio_id'])) {
            $query->where('socio_id', $filtros['socio_id']);
        }

        if (isset($filtros['estado'])) {
            $query->where('estado', $filtros['estado']);
        }

        if (isset($filtros['search'])) {
            $search = $filtros['search'];
            $query->whereHas('socio', function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('cedula', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filtros['per_page'] ?? 10);
    }

    /**
     * Obtener detalle de préstamo con cronograma
     */
    public function obtenerDetallePrestamo(int $prestamoId): Prestamo
    {
        return Prestamo::with([
            'socio',
            'creadoPor',
            'cuotas' => function ($query) {
                $query->orderBy('numero_cuota');
            }
        ])->findOrFail($prestamoId);
    }
}
