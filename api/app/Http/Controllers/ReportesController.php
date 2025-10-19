<?php

namespace App\Http\Controllers;

use App\Models\Socio;
use App\Models\Cuenta;
use App\Services\ContabilidadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportesController extends Controller
{
    protected $contabilidadService;

    public function __construct(ContabilidadService $contabilidadService)
    {
        $this->contabilidadService = $contabilidadService;
    }

    /**
     * Obtener estado de cuenta de un socio
     */
    public function estadoSocio(Request $request, int $socioId): JsonResponse
    {
        try {
            // Verificar que el socio existe
            $socio = Socio::findOrFail($socioId);

            // Obtener la cuenta del socio
            $cuenta = Cuenta::where('propietario_tipo', 'SOCIO')
                ->where('propietario_id', $socioId)
                ->first();

            if (!$cuenta) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró la cuenta del socio'
                ], 404);
            }

            // Obtener movimientos de la cuenta
            $movimientos = $this->contabilidadService->obtenerMovimientos($cuenta->id);

            // Obtener resumen de la cuenta
            $resumen = $this->contabilidadService->obtenerResumenCuenta($cuenta->id);

            // Obtener saldo actual
            $saldoActual = $this->contabilidadService->saldoCuenta($cuenta->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'socio' => [
                        'id' => $socio->id,
                        'codigo' => $socio->codigo,
                        'cedula' => $socio->cedula,
                        'nombres' => $socio->nombres,
                        'apellidos' => $socio->apellidos,
                        'nombre_completo' => $socio->nombre_completo,
                        'estado' => $socio->estado,
                    ],
                    'cuenta' => [
                        'id' => $cuenta->id,
                        'nombre' => $cuenta->nombre,
                    ],
                    'resumen' => $resumen,
                    'saldo_actual' => $saldoActual,
                    'movimientos' => $movimientos->map(function ($movimiento) {
                        return [
                            'id' => $movimiento->id,
                            'tipo' => $movimiento->tipo,
                            'monto' => $movimiento->monto,
                            'ref_tipo' => $movimiento->ref_tipo,
                            'ref_id' => $movimiento->ref_id,
                            'descripcion' => $movimiento->descripcion,
                            'creado_por' => $movimiento->creadoPor->nombre,
                            'fecha' => $movimiento->created_at->setTimezone('America/Guayaquil')->format('Y-m-d'),
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estado de cuenta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reporte de cartera de préstamos
     */
    public function carteraPrestamos(Request $request): JsonResponse
    {
        try {
            $cuentaCartera = $this->contabilidadService->obtenerCuentaCartera();
            
            // Capital pendiente en cartera
            $capitalPendiente = $this->contabilidadService->saldoCuentaPorRefTipo($cuentaCartera->id, 'PRESTAMO');
            
            // Movimientos de cartera
            $movimientos = $this->contabilidadService->obtenerMovimientos($cuentaCartera->id, 'PRESTAMO', 50);

            return response()->json([
                'success' => true,
                'data' => [
                    'cuenta_cartera' => [
                        'id' => $cuentaCartera->id,
                        'nombre' => $cuentaCartera->nombre,
                    ],
                    'capital_pendiente' => $capitalPendiente,
                    'movimientos_recientes' => $movimientos->map(function ($movimiento) {
                        return [
                            'id' => $movimiento->id,
                            'tipo' => $movimiento->tipo,
                            'monto' => $movimiento->monto,
                            'descripcion' => $movimiento->descripcion,
                            'fecha' => $movimiento->created_at->setTimezone('America/Guayaquil')->format('Y-m-d'),
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reporte de cartera: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reporte de ingresos por intereses
     */
    public function ingresosIntereses(Request $request): JsonResponse
    {
        try {
            $cuentaAsotema = Cuenta::asotema()->first();
            
            if (!$cuentaAsotema) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró la cuenta de ASOTEMA'
                ], 404);
            }

            // Ingresos por intereses (DEBE en cuenta ASOTEMA con ref_tipo PAGO)
            $ingresos = $this->contabilidadService->saldoCuentaPorRefTipo($cuentaAsotema->id, 'PAGO');
            
            // Movimientos de ingresos
            $movimientos = $this->contabilidadService->obtenerMovimientos($cuentaAsotema->id, 'PAGO', 50);

            return response()->json([
                'success' => true,
                'data' => [
                    'cuenta_asotema' => [
                        'id' => $cuentaAsotema->id,
                        'nombre' => $cuentaAsotema->nombre,
                    ],
                    'ingresos_intereses' => $ingresos,
                    'movimientos_recientes' => $movimientos->map(function ($movimiento) {
                        return [
                            'id' => $movimiento->id,
                            'tipo' => $movimiento->tipo,
                            'monto' => $movimiento->monto,
                            'descripcion' => $movimiento->descripcion,
                            'fecha' => $movimiento->created_at->setTimezone('America/Guayaquil')->format('Y-m-d'),
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reporte de ingresos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener meses disponibles para descuentos mensuales
     */
    public function descuentosMensualesMeses(): JsonResponse
    {
        try {
            $descuentosService = new \App\Services\DescuentosMensualesService();
            $meses = $descuentosService->obtenerMesesDisponibles();
            
            return response()->json([
                'success' => true,
                'data' => $meses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener meses disponibles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener descuentos mensuales
     */
    public function descuentosMensuales(Request $request): JsonResponse
    {
        $request->validate([
            'mes' => 'required|date_format:Y-m'
        ]);

        try {
            $descuentosService = new \App\Services\DescuentosMensualesService();
            $descuentos = $descuentosService->obtenerDescuentosMensuales($request->mes);
            
            return response()->json([
                'success' => true,
                'data' => $descuentos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener descuentos mensuales: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF de descuentos mensuales
     */
    public function descuentosMensualesPdf(Request $request)
    {
        $request->validate([
            'mes' => 'required|date_format:Y-m'
        ]);

        try {
            $descuentosService = new \App\Services\DescuentosMensualesService();
            $descuentos = $descuentosService->obtenerDescuentosMensuales($request->mes);
            
            $pdf = \PDF::loadView('reports.descuentos-mensuales', compact('descuentos'));
            
            $nombreArchivo = 'descuentos-mensuales-' . $request->mes . '.pdf';
            
            return $pdf->download($nombreArchivo);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vista previa del PDF de descuentos mensuales
     */
    public function descuentosMensualesPreview(Request $request)
    {
        $request->validate([
            'mes' => 'required|date_format:Y-m'
        ]);

        try {
            \Log::info('Iniciando generación de PDF de descuentos mensuales para mes: ' . $request->mes);
            
            $descuentosService = new \App\Services\DescuentosMensualesService();
            $descuentos = $descuentosService->obtenerDescuentosMensuales($request->mes);
            
            \Log::info('Datos de descuentos obtenidos exitosamente');
            
            // Verificar que la vista existe
            $viewPath = resource_path('views/reports/descuentos-mensuales.blade.php');
            if (!file_exists($viewPath)) {
                \Log::error('Vista no encontrada: ' . $viewPath);
                return response()->json([
                    'success' => false,
                    'message' => 'Vista del PDF no encontrada'
                ], 500);
            }
            
            \Log::info('Generando PDF con DomPDF');
            // Generar PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.descuentos-mensuales', [
                'descuentos' => $descuentos
            ]);
            
            $pdf->setPaper('A4', 'landscape');
            
            $filename = "descuentos_mensuales_{$request->mes}.pdf";
            $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename); // Limpiar caracteres especiales
            
            \Log::info('PDF generado exitosamente, descargando como: ' . $filename);
            
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            \Log::error('Error al generar PDF de descuentos mensuales: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar vista previa: ' . $e->getMessage()
            ], 500);
        }
    }
}