<?php

namespace App\Services;

use App\Models\Socio;
use App\Models\AporteAhorro;
use App\Models\Evento;
use App\Models\CuotaPrestamo;
use App\Models\Prestamo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DescuentosMensualesService
{
    public function obtenerDescuentosMensuales($mes)
    {
        $fecha = Carbon::createFromFormat('Y-m', $mes);
        $inicioMes = $fecha->copy()->startOfMonth();
        $finMes = $fecha->copy()->endOfMonth();

        // Obtener todos los socios activos
        $socios = Socio::where('estado', 'ACTIVO')
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->get();

        // Obtener todos los préstamos únicos que tienen cuotas en este mes
        $prestamosUnicos = $this->obtenerPrestamosUnicosDelMes($inicioMes, $finMes);
        
        $descuentos = [];

        foreach ($socios as $socio) {
            $ahorro = $this->calcularAhorroMensual($socio->id, $inicioMes, $finMes);
            $gastos = $this->calcularGastosEventos($socio->id, $inicioMes, $finMes);
            
            // Calcular cuotas por préstamo individual
            $cuotasPorPrestamo = $this->calcularCuotasPorPrestamo($socio->id, $prestamosUnicos, $inicioMes, $finMes);
            
            $descuento = [
                'socio' => $socio,
                'ahorro' => $ahorro,
                'gastos_eventos' => $gastos,
                'cuotas_por_prestamo' => $cuotasPorPrestamo,
            ];

            // Calcular total
            $totalCuotas = collect($cuotasPorPrestamo)->sum();
            $descuento['total'] = $ahorro + $gastos + $totalCuotas;

            // Solo incluir si tiene algún descuento
            if ($descuento['total'] > 0) {
                $descuentos[] = $descuento;
            }
        }

        // Calcular totales
        $totales = [
            'ahorro' => collect($descuentos)->sum('ahorro'),
            'gastos_eventos' => collect($descuentos)->sum('gastos_eventos'),
            'total' => collect($descuentos)->sum('total'),
        ];

        // Agregar totales por préstamo
        foreach ($prestamosUnicos as $prestamo) {
            $totales["prestamo_{$prestamo->id}"] = collect($descuentos)->sum(function($descuento) use ($prestamo) {
                return $descuento['cuotas_por_prestamo']["prestamo_{$prestamo->id}"] ?? 0;
            });
        }

        // Nombres de meses en español
        $mesesEspanol = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
            5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
            9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre'
        ];

        return [
            'mes' => ucfirst($mesesEspanol[$fecha->month]) . ' ' . $fecha->year,
            'fecha_corte' => $fecha->format('Y-m-d'),
            'descuentos' => $descuentos,
            'totales' => $totales,
            'prestamos_unicos' => $prestamosUnicos,
        ];
    }

    private function calcularAhorroMensual($socioId, $inicioMes, $finMes)
    {
        return AporteAhorro::where('socio_id', $socioId)
            ->whereBetween('fecha_operacion', [$inicioMes, $finMes])
            ->where('tipo', 'DEPOSITO')
            ->sum('monto');
    }

    private function calcularGastosEventos($socioId, $inicioMes, $finMes)
    {
        // Obtener eventos de tipo GASTO donde el socio participó
        $eventos = Evento::where('clase', 'GASTO')
            ->whereBetween('fecha_evento', [$inicioMes, $finMes])
            ->whereHas('asistentes', function($query) use ($socioId) {
                $query->where('socio_id', $socioId)
                      ->where('asistio', true);
            })
            ->get();

        $totalGastos = 0;

        foreach ($eventos as $evento) {
            if ($evento->tipo_evento === 'COMPARTIDO') {
                $totalGastos += $evento->aporte_socio ?? 0;
            } elseif ($evento->tipo_evento === 'CUBRE_ASOTEMA') {
                // Para CUBRE_ASOTEMA, el socio no paga nada
                $totalGastos += 0;
            }
        }

        return $totalGastos;
    }

    private function calcularCuotasPrestamos($socioId, $inicioMes, $finMes)
    {
        return CuotaPrestamo::whereHas('prestamo', function($query) use ($socioId) {
                $query->where('socio_id', $socioId);
            })
            ->whereBetween('fecha_vencimiento', [$inicioMes, $finMes])
            ->whereIn('estado', ['PENDIENTE', 'PARCIAL'])
            ->sum('monto_esperado');
    }

    private function obtenerPrestamosUnicosDelMes($inicioMes, $finMes)
    {
        return Prestamo::whereHas('cuotas', function($query) use ($inicioMes, $finMes) {
                $query->whereBetween('fecha_vencimiento', [$inicioMes, $finMes])
                      ->whereIn('estado', ['PENDIENTE', 'PARCIAL']);
            })
            ->orderBy('id')
            ->get();
    }

    private function calcularCuotasPorPrestamo($socioId, $prestamosUnicos, $inicioMes, $finMes)
    {
        $cuotasPorPrestamo = [];
        
        foreach ($prestamosUnicos as $prestamo) {
            $monto = CuotaPrestamo::where('prestamo_id', $prestamo->id)
                ->whereHas('prestamo', function($query) use ($socioId) {
                    $query->where('socio_id', $socioId);
                })
                ->whereBetween('fecha_vencimiento', [$inicioMes, $finMes])
                ->whereIn('estado', ['PENDIENTE', 'PARCIAL'])
                ->sum('monto_esperado');
                
            $cuotasPorPrestamo["prestamo_{$prestamo->id}"] = $monto;
        }
        
        return $cuotasPorPrestamo;
    }

    private function calcularPrestamosEspecificos($socioId, $inicioMes, $finMes)
    {
        // Por ahora, no hay préstamos específicos configurados
        // En el futuro se pueden agregar préstamos especiales como "Paseo 2023"
        return 0;
    }

    public function obtenerMesesDisponibles()
    {
        $meses = [];

        // Obtener meses con ahorros
        $mesesAhorros = AporteAhorro::selectRaw('DATE_FORMAT(fecha_operacion, "%Y-%m") as mes')
            ->distinct()
            ->orderBy('mes', 'desc')
            ->pluck('mes');

        // Obtener meses con eventos
        $mesesEventos = Evento::selectRaw('DATE_FORMAT(fecha_evento, "%Y-%m") as mes')
            ->distinct()
            ->orderBy('mes', 'desc')
            ->pluck('mes');

        // Obtener meses con cuotas
        $mesesCuotas = CuotaPrestamo::selectRaw('DATE_FORMAT(fecha_vencimiento, "%Y-%m") as mes')
            ->distinct()
            ->orderBy('mes', 'desc')
            ->pluck('mes');

        // Combinar todos los meses
        $todosMeses = $mesesAhorros->merge($mesesEventos)->merge($mesesCuotas)->unique()->sortDesc();

        // Nombres de meses en español
        $mesesEspanol = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
            5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
            9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre'
        ];

        foreach ($todosMeses as $mes) {
            $fecha = Carbon::createFromFormat('Y-m', $mes);
            $mesEspanol = $mesesEspanol[$fecha->month];
            $meses[] = [
                'value' => $mes,
                'label' => ucfirst($mesEspanol) . ' ' . $fecha->year,
                'fecha' => $fecha->format('Y-m-d')
            ];
        }

        return $meses;
    }
}
