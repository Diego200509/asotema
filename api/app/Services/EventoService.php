<?php

namespace App\Services;

use App\Models\Evento;
use App\Models\Cuenta;
use App\Models\AsistenteEvento;
use App\Models\Movimiento;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EventoService
{
    /**
     * Obtener o crear la cuenta institucional de Eventos ASOTEMA
     */
    public function obtenerCuentaEventosAsotema(): Cuenta
    {
        $cuenta = Cuenta::where('propietario_tipo', 'ASOTEMA')
            ->where('propietario_id', null)
            ->where('nombre', 'Eventos ASOTEMA (Operativo)')
            ->where('tipo', 'INSTITUCIONAL')
            ->first();

        if (!$cuenta) {
            $cuenta = Cuenta::create([
                'propietario_tipo' => 'ASOTEMA',
                'propietario_id' => null,
                'nombre' => 'Eventos ASOTEMA (Operativo)',
                'tipo' => 'INSTITUCIONAL',
            ]);

            Log::info('Cuenta institucional de Eventos ASOTEMA creada', ['cuenta_id' => $cuenta->id]);
        }

        return $cuenta;
    }

    /**
     * Contabilizar un evento (transaccional)
     */
    public function contabilizar(Evento $evento): array
    {
        if ($evento->contabilizado) {
            throw new \Exception('El evento ya ha sido contabilizado');
        }

        $asistentesConfirmados = $evento->asistentesConfirmados()->get();
        
        if ($asistentesConfirmados->isEmpty()) {
            throw new \Exception('No hay asistentes confirmados para contabilizar');
        }

        $cuentaEventos = $this->obtenerCuentaEventosAsotema();
        $resultado = [
            'asistentes_procesados' => 0,
            'total_ingresos' => 0,
            'total_costos' => 0,
            'neto' => 0,
            'movimientos_creados' => []
        ];

        DB::beginTransaction();
        
        try {
            foreach ($asistentesConfirmados as $asistente) {
                $socio = $asistente->socio;
                $socioCuenta = $socio->cuenta;
                
                if (!$socioCuenta) {
                    throw new \Exception("El socio {$socio->nombre_completo} no tiene cuenta asociada");
                }

                // 1. Registrar ingreso por precio_por_asistente
                // DEBE en "Eventos ASOTEMA (Operativo)" por precio
                $movimientoIngreso = Movimiento::create([
                    'cuenta_id' => $cuentaEventos->id,
                    'tipo' => 'DEBE',
                    'monto' => $evento->precio_por_asistente,
                    'descripcion' => "Ingreso por evento: {$evento->nombre} - {$socio->nombre_completo}",
                    'ref_tipo' => 'EVENTO',
                    'ref_id' => $evento->id,
                    'creado_por' => auth()->id() ?? $evento->creado_por,
                ]);

                $resultado['total_ingresos'] += $evento->precio_por_asistente;
                $resultado['movimientos_creados'][] = [
                    'tipo' => 'INGRESO',
                    'cuenta' => 'Eventos ASOTEMA (Operativo)',
                    'monto' => $evento->precio_por_asistente,
                    'movimiento_id' => $movimientoIngreso->id
                ];

                // 2. Procesar según tipo de evento
                if ($evento->tipo_evento === 'COMPARTIDO') {
                    // Descuento al socio por costo_por_asistente
                    // HABER en cuenta CORRIENTE del socio
                    $movimientoDescuento = Movimiento::create([
                        'cuenta_id' => $socioCuenta->id,
                        'tipo' => 'HABER',
                        'monto' => $evento->costo_por_asistente,
                        'descripcion' => "Descuento por evento: {$evento->nombre}",
                        'ref_tipo' => 'EVENTO',
                        'ref_id' => $evento->id,
                        'creado_por' => auth()->id() ?? $evento->creado_por,
                    ]);

                    $resultado['total_costos'] += $evento->costo_por_asistente;
                    $resultado['movimientos_creados'][] = [
                        'tipo' => 'DESCUENTO_SOCIO',
                        'cuenta' => "Socio: {$socio->nombre_completo}",
                        'monto' => $evento->costo_por_asistente,
                        'movimiento_id' => $movimientoDescuento->id
                    ];

                } elseif ($evento->tipo_evento === 'CUBRE_ASOTEMA') {
                    // Gasto institucional por costo_por_asistente
                    // HABER en "Eventos ASOTEMA (Operativo)"
                    $movimientoGasto = Movimiento::create([
                        'cuenta_id' => $cuentaEventos->id,
                        'tipo' => 'HABER',
                        'monto' => $evento->costo_por_asistente,
                        'descripcion' => "Gasto por evento: {$evento->nombre} - {$socio->nombre_completo}",
                        'ref_tipo' => 'EVENTO',
                        'ref_id' => $evento->id,
                        'creado_por' => auth()->id() ?? $evento->creado_por,
                    ]);

                    $resultado['total_costos'] += $evento->costo_por_asistente;
                    $resultado['movimientos_creados'][] = [
                        'tipo' => 'GASTO_INSTITUCIONAL',
                        'cuenta' => 'Eventos ASOTEMA (Operativo)',
                        'monto' => $evento->costo_por_asistente,
                        'movimiento_id' => $movimientoGasto->id
                    ];
                }

                $resultado['asistentes_procesados']++;
            }

            // Marcar evento como contabilizado
            $evento->update(['contabilizado' => true]);
            
            // Calcular neto
            $resultado['neto'] = $resultado['total_ingresos'] - $resultado['total_costos'];

            DB::commit();

            Log::info('Evento contabilizado exitosamente', [
                'evento_id' => $evento->id,
                'resultado' => $resultado
            ]);

            return $resultado;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al contabilizar evento', [
                'evento_id' => $evento->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Reversar contabilización de un evento (transaccional)
     */
    public function reversar(Evento $evento): array
    {
        if (!$evento->contabilizado) {
            throw new \Exception('El evento no ha sido contabilizado');
        }

        $movimientosOriginales = Movimiento::where('ref_tipo', 'EVENTO')
            ->where('ref_id', $evento->id)
            ->get();

        if ($movimientosOriginales->isEmpty()) {
            throw new \Exception('No se encontraron movimientos para revertir');
        }

        $resultado = [
            'movimientos_revertidos' => 0,
            'total_revertido' => 0,
            'movimientos_creados' => []
        ];

        DB::beginTransaction();

        try {
            foreach ($movimientosOriginales as $movimientoOriginal) {
                // Crear movimiento inverso
                $tipoInverso = $movimientoOriginal->tipo === 'DEBE' ? 'HABER' : 'DEBE';
                
                $movimientoReverso = Movimiento::create([
                    'cuenta_id' => $movimientoOriginal->cuenta_id,
                    'tipo' => $tipoInverso,
                    'monto' => $movimientoOriginal->monto,
                    'descripcion' => "REVERSO - {$movimientoOriginal->descripcion}",
                    'ref_tipo' => 'EVENTO_REVERSO',
                    'ref_id' => $evento->id,
                    'creado_por' => auth()->id(),
                ]);

                $resultado['movimientos_revertidos']++;
                $resultado['total_revertido'] += $movimientoOriginal->monto;
                $resultado['movimientos_creados'][] = [
                    'tipo' => 'REVERSO',
                    'tipo_original' => $movimientoOriginal->tipo,
                    'monto' => $movimientoOriginal->monto,
                    'movimiento_id' => $movimientoReverso->id
                ];
            }

            // Marcar evento como no contabilizado
            $evento->update(['contabilizado' => false]);

            DB::commit();

            Log::info('Evento revertido exitosamente', [
                'evento_id' => $evento->id,
                'resultado' => $resultado
            ]);

            return $resultado;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al revertir evento', [
                'evento_id' => $evento->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Obtener resumen contable de un evento
     */
    public function obtenerResumenContable(Evento $evento): array
    {
        $asistentesConfirmados = $evento->asistentesConfirmados()->count();
        
        $resumen = [
            'evento' => [
                'id' => $evento->id,
                'nombre' => $evento->nombre,
                'tipo_evento' => $evento->tipo_evento,
                'contabilizado' => $evento->contabilizado,
                'fecha_evento' => $evento->fecha_evento,
            ],
            'asistentes' => [
                'total' => $evento->asistentes()->count(),
                'confirmados' => $asistentesConfirmados,
                'precio_por_asistente' => $evento->precio_por_asistente,
                'costo_por_asistente' => $evento->costo_por_asistente,
            ],
            'financiero' => [
                'total_ingresos_potenciales' => $asistentesConfirmados * $evento->precio_por_asistente,
                'total_costos_potenciales' => $asistentesConfirmados * $evento->costo_por_asistente,
                'neto_potencial' => ($asistentesConfirmados * $evento->precio_por_asistente) - ($asistentesConfirmados * $evento->costo_por_asistente),
            ]
        ];

        // Si está contabilizado, obtener datos reales
        if ($evento->contabilizado) {
            $movimientos = Movimiento::where('ref_tipo', 'EVENTO')
                ->where('ref_id', $evento->id)
                ->get();

            $ingresosReales = $movimientos->where('tipo', 'DEBE')->sum('monto');
            $costosReales = $movimientos->where('tipo', 'HABER')->sum('monto');

            $resumen['financiero']['total_ingresos_reales'] = $ingresosReales;
            $resumen['financiero']['total_costos_reales'] = $costosReales;
            $resumen['financiero']['neto_real'] = $ingresosReales - $costosReales;
        }

        return $resumen;
    }

    /**
     * Agregar asistentes a un evento
     */
    public function agregarAsistentes(Evento $evento, array $socioIds): array
    {
        $resultado = [
            'agregados' => 0,
            'existentes' => 0,
            'errores' => []
        ];

        foreach ($socioIds as $socioId) {
            try {
                // Verificar si ya existe
                $existente = AsistenteEvento::where('evento_id', $evento->id)
                    ->where('socio_id', $socioId)
                    ->first();

                if ($existente) {
                    $resultado['existentes']++;
                    continue;
                }

                // Verificar que el socio existe y tiene cuenta
                $socio = Socio::with('cuenta')->find($socioId);
                if (!$socio) {
                    $resultado['errores'][] = "Socio ID {$socioId} no encontrado";
                    continue;
                }

                if (!$socio->cuenta) {
                    $resultado['errores'][] = "Socio {$socio->nombre_completo} no tiene cuenta asociada";
                    continue;
                }

                // Crear asistente
                AsistenteEvento::create([
                    'evento_id' => $evento->id,
                    'socio_id' => $socioId,
                    'asistio' => true, // Por defecto asiste
                ]);

                $resultado['agregados']++;

            } catch (\Exception $e) {
                $resultado['errores'][] = "Error al agregar socio ID {$socioId}: " . $e->getMessage();
            }
        }

        return $resultado;
    }

    /**
     * Toggle asistencia de un socio
     */
    public function toggleAsistencia(Evento $evento, int $socioId, ?bool $asistio = null): array
    {
        $asistente = AsistenteEvento::where('evento_id', $evento->id)
            ->where('socio_id', $socioId)
            ->first();

        if (!$asistente) {
            // Si el socio no está registrado como asistente, lo agregamos automáticamente
            $nuevoEstado = $asistio !== null ? $asistio : true; // Usar el valor proporcionado o true por defecto
            $asistente = AsistenteEvento::create([
                'evento_id' => $evento->id,
                'socio_id' => $socioId,
                'asistio' => $nuevoEstado,
            ]);
        } else {
            // Si ya existe, usar el valor proporcionado o hacer toggle
            if ($asistio !== null) {
                $asistente->update(['asistio' => $asistio]);
            } else {
                $asistente->toggleAsistencia();
            }
        }

        return [
            'socio_id' => $socioId,
            'asistio' => $asistente->asistio,
            'socio_nombre' => $asistente->socio->nombre_completo
        ];
    }
}
