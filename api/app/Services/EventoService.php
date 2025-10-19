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
     * Crear y contabilizar un evento de INGRESO (transaccional)
     */
    public function storeIngreso(array $data): array
    {
        DB::beginTransaction();
        
        try {
            // Crear el evento (sin contabilizar aún)
            $evento = Evento::create([
                'nombre' => $data['nombre'],
                'motivo' => $data['motivo'],
                'fecha_evento' => $data['fecha_evento'],
                'clase' => 'INGRESO',
                'monto_ingreso' => $data['monto_ingreso'],
                'contabilizado' => false, // Se contabilizará en el siguiente paso
                'creado_por' => auth()->id() ?? 1, // Fallback a usuario admin si no hay autenticación
            ]);

            // Contabilizar inmediatamente
            $resultadoContable = $this->contabilizarIngreso($evento);

            DB::commit();

            return [
                'evento' => $evento,
                'contabilizacion' => $resultadoContable
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear evento de ingreso', [
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Contabilizar un evento de INGRESO (transaccional)
     */
    public function contabilizarIngreso(Evento $evento): array
    {
        if ($evento->clase !== 'INGRESO') {
            throw new \Exception('Este método solo es para eventos de INGRESO');
        }

        if ($evento->contabilizado) {
            throw new \Exception('El evento de ingreso ya ha sido contabilizado');
        }

        $cuentaEventos = $this->obtenerCuentaEventosAsotema();
        
        $resultado = [
            'movimientos_creados' => [],
            'total_ingreso' => $evento->monto_ingreso
        ];

        // Crear movimiento DEBE en "Eventos ASOTEMA (Operativo)"
        $movimientoIngreso = Movimiento::create([
            'cuenta_id' => $cuentaEventos->id,
            'tipo' => 'DEBE',
            'monto' => $evento->monto_ingreso,
            'descripcion' => "Ingreso por evento: {$evento->nombre}",
            'ref_tipo' => 'EVENTO_INGRESO',
            'ref_id' => $evento->id,
            'creado_por' => auth()->id() ?? $evento->creado_por,
        ]);

        $resultado['movimientos_creados'][] = [
            'tipo' => 'INGRESO',
            'cuenta' => 'Eventos ASOTEMA (Operativo)',
            'monto' => $evento->monto_ingreso,
            'movimiento_id' => $movimientoIngreso->id
        ];

        // Marcar evento como contabilizado
        $evento->update(['contabilizado' => true]);

        Log::info('Evento de ingreso contabilizado exitosamente', [
            'evento_id' => $evento->id,
            'resultado' => $resultado
        ]);

        return $resultado;
    }

    /**
     * Contabilizar un evento de GASTO (transaccional)
     */
    public function contabilizarGasto(Evento $evento): array
    {
        if ($evento->clase !== 'GASTO') {
            throw new \Exception('Este método solo es para eventos de GASTO');
        }

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

                // Procesar según tipo de evento
                if ($evento->tipo_evento === 'COMPARTIDO') {
                    // COMPARTIDO: Solo gastos - Socio paga su aporte, ASOTEMA paga el resto
                    
                    // 1. Descuento al socio por su aporte
                    $movimientoDescuentoSocio = Movimiento::create([
                        'cuenta_id' => $socioCuenta->id,
                        'tipo' => 'HABER',
                        'monto' => $evento->aporte_socio,
                        'descripcion' => "Aporte del socio por evento: {$evento->nombre}",
                        'ref_tipo' => 'EVENTO',
                        'ref_id' => $evento->id,
                        'creado_por' => auth()->id() ?? $evento->creado_por,
                    ]);

                    $resultado['movimientos_creados'][] = [
                        'tipo' => 'APORTE_SOCIO',
                        'cuenta' => "Socio: {$socio->nombre_completo}",
                        'monto' => $evento->aporte_socio,
                        'movimiento_id' => $movimientoDescuentoSocio->id
                    ];

                    // 2. Gasto de ASOTEMA por su aporte
                    $movimientoGastoAsotema = Movimiento::create([
                        'cuenta_id' => $cuentaEventos->id,
                        'tipo' => 'HABER',
                        'monto' => $evento->aporte_asotema,
                        'descripcion' => "Aporte de ASOTEMA por evento: {$evento->nombre} - {$socio->nombre_completo}",
                        'ref_tipo' => 'EVENTO',
                        'ref_id' => $evento->id,
                        'creado_por' => auth()->id() ?? $evento->creado_por,
                    ]);

                    $resultado['total_costos'] += $evento->aporte_asotema;
                    $resultado['movimientos_creados'][] = [
                        'tipo' => 'APORTE_ASOTEMA',
                        'cuenta' => 'Eventos ASOTEMA (Operativo)',
                        'monto' => $evento->aporte_asotema,
                        'movimiento_id' => $movimientoGastoAsotema->id
                    ];

                } elseif ($evento->tipo_evento === 'CUBRE_ASOTEMA') {
                    // CUBRE_ASOTEMA: ASOTEMA cubre todo el costo
                    
                    // 1. Gasto de ASOTEMA por el costo total
                    $movimientoGasto = Movimiento::create([
                        'cuenta_id' => $cuentaEventos->id,
                        'tipo' => 'HABER',
                        'monto' => $evento->costo_por_socio,
                        'descripcion' => "Costo cubierto por ASOTEMA - evento: {$evento->nombre} - {$socio->nombre_completo}",
                        'ref_tipo' => 'EVENTO',
                        'ref_id' => $evento->id,
                        'creado_por' => auth()->id() ?? $evento->creado_por,
                    ]);

                    $resultado['total_costos'] += $evento->costo_por_socio;
                    $resultado['movimientos_creados'][] = [
                        'tipo' => 'COSTO_CUBIERTO',
                        'cuenta' => 'Eventos ASOTEMA (Operativo)',
                        'monto' => $evento->costo_por_socio,
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

        // Determinar el tipo de referencia según la clase del evento
        $refTipo = $evento->clase === 'INGRESO' ? 'EVENTO_INGRESO' : 'EVENTO';
        
        $movimientosOriginales = Movimiento::where('ref_tipo', $refTipo)
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
                    'creado_por' => auth()->id() ?? 1, // Fallback a usuario admin si no hay autenticación
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
        $resumen = [
            'evento' => [
                'id' => $evento->id,
                'nombre' => $evento->nombre,
                'clase' => $evento->clase,
                'contabilizado' => $evento->contabilizado,
                'fecha_evento' => $evento->fecha_evento,
            ],
            'financiero' => []
        ];

        if ($evento->clase === 'INGRESO') {
            $resumen['evento']['monto_ingreso'] = $evento->monto_ingreso;
            $resumen['financiero'] = [
                'total_ingreso' => $evento->monto_ingreso,
                'total_costos' => 0,
                'neto' => $evento->monto_ingreso,
            ];
        } else {
            $asistentesConfirmados = $evento->asistentesConfirmados()->count();
            $resumen['evento']['tipo_evento'] = $evento->tipo_evento;
            if ($evento->tipo_evento === 'COMPARTIDO') {
                $resumen['asistentes'] = [
                    'total' => $evento->asistentes()->count(),
                    'confirmados' => $asistentesConfirmados,
                    'valor_evento' => $evento->valor_evento,
                    'aporte_socio' => $evento->aporte_socio,
                    'aporte_asotema' => $evento->aporte_asotema,
                ];
                $resumen['financiero'] = [
                    'total_ingresos_potenciales' => 0, // No hay ingresos en eventos GASTO
                    'total_costos_potenciales' => $asistentesConfirmados * $evento->valor_evento, // Total de gastos
                    'neto_potencial' => 0, // No hay neto, solo gastos compartidos
                ];
            } else {
                $resumen['asistentes'] = [
                    'total' => $evento->asistentes()->count(),
                    'confirmados' => $asistentesConfirmados,
                    'costo_por_socio' => $evento->costo_por_socio,
                ];
                $resumen['financiero'] = [
                    'total_ingresos_potenciales' => 0,
                    'total_costos_potenciales' => $asistentesConfirmados * $evento->costo_por_socio,
                    'neto_potencial' => 0,
                ];
            }
        }

        // Si está contabilizado, obtener datos reales
        if ($evento->contabilizado) {
            $refTipo = $evento->clase === 'INGRESO' ? 'EVENTO_INGRESO' : 'EVENTO';
            $movimientos = Movimiento::where('ref_tipo', $refTipo)
                ->where('ref_id', $evento->id)
                ->get();

            $ingresosReales = $movimientos->where('tipo', 'DEBE')->sum('monto');
            $costosReales = $movimientos->where('tipo', 'HABER')->sum('monto');

            if ($evento->clase === 'INGRESO') {
                $resumen['financiero']['total_ingreso_real'] = $ingresosReales;
                $resumen['financiero']['neto_real'] = $ingresosReales;
            } else {
                $resumen['financiero']['total_ingresos_reales'] = $ingresosReales;
                $resumen['financiero']['total_costos_reales'] = $costosReales;
                $resumen['financiero']['neto_real'] = $ingresosReales - $costosReales;
            }
        }

        return $resumen;
    }

    /**
     * Crear un evento de GASTO (sin contabilizar)
     */
    public function storeGasto(array $data): Evento
    {
        $eventoData = [
            'nombre' => $data['nombre'],
            'motivo' => $data['motivo'],
            'fecha_evento' => $data['fecha_evento'],
            'clase' => 'GASTO',
            'tipo_evento' => $data['tipo_evento'],
            'contabilizado' => false, // No se contabiliza hasta llamar /contabilizar
            'creado_por' => auth()->id() ?? 1, // Fallback a usuario admin si no hay autenticación
        ];

        // Agregar campos específicos según el tipo de evento
        if ($data['tipo_evento'] === 'COMPARTIDO') {
            // Calcular valor_evento automáticamente
            $eventoData['valor_evento'] = $data['aporte_socio'] + $data['aporte_asotema'];
            $eventoData['aporte_socio'] = $data['aporte_socio'];
            $eventoData['aporte_asotema'] = $data['aporte_asotema'];
        } elseif ($data['tipo_evento'] === 'CUBRE_ASOTEMA') {
            $eventoData['costo_por_socio'] = $data['costo_por_socio'];
        }

        return Evento::create($eventoData);
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
