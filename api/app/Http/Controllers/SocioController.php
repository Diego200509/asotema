<?php

namespace App\Http\Controllers;

use App\Models\Socio;
use App\Models\Cuenta;
use App\Http\Requests\StoreSocioRequest;
use App\Http\Requests\UpdateSocioRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SocioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Socio::query();

            // Búsqueda
            if ($request->has('q') && $request->q) {
                $query->search($request->q);
            }

            // Filtro por estado
            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            // Paginación
            $perPage = $request->input('per_page', 6);
            
            // Si se solicita 'all', obtener todos los registros sin paginación
            if ($perPage === 'all') {
                $socios = $query->orderBy('apellidos', 'asc')
                               ->orderBy('nombres', 'asc')
                               ->get();
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'data' => $socios,
                        'meta' => [
                            'current_page' => 1,
                            'last_page' => 1,
                            'per_page' => $socios->count(),
                            'total' => $socios->count(),
                        ]
                    ],
                ], 200);
            }
            
            $socios = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $socios,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los socios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSocioRequest $request)
    {
        try {
            DB::beginTransaction();

            // Generar código automático
            $codigo = Socio::generarCodigo();

            // Crear socio
            $socio = Socio::create([
                'codigo' => $codigo,
                'cedula' => $request->cedula,
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'estado' => $request->estado ?? 'ACTIVO',
                'fecha_ingreso' => $request->fecha_ingreso,
            ]);

            // Crear cuenta CORRIENTE automáticamente para el socio
            Cuenta::create([
                'propietario_tipo' => 'SOCIO',
                'propietario_id' => $socio->id,
                'nombre' => "Cuenta {$socio->nombre_completo}",
                'tipo' => 'CORRIENTE',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Socio creado exitosamente',
                'data' => $socio->load('cuenta'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el socio',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Socio $socio)
    {
        try {
            $socio->load('cuenta');

            return response()->json([
                'success' => true,
                'data' => $socio,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el socio',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSocioRequest $request, Socio $socio)
    {
        try {
            DB::beginTransaction();

            $socio->update([
                'cedula' => $request->cedula,
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'estado' => $request->estado,
                'fecha_ingreso' => $request->fecha_ingreso,
            ]);

            // Actualizar nombre de la cuenta si existe
            if ($socio->cuenta) {
                $socio->cuenta->update([
                    'nombre' => "Cuenta {$socio->nombre_completo}",
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Socio actualizado exitosamente',
                'data' => $socio->load('cuenta'),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el socio',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(Socio $socio)
    {
        try {
            $socio->delete();

            return response()->json([
                'success' => true,
                'message' => 'Socio eliminado exitosamente',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el socio',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generar PDF del estado de cuenta del socio
     */
    public function estadoCuentaPDF(Socio $socio)
    {
        try {
            \Log::info('Iniciando generación de PDF para socio ID: ' . $socio->id);
            
            // Verificar que el socio existe en la base de datos
            $socio = Socio::findOrFail($socio->id);
            \Log::info('Socio encontrado: ' . $socio->nombres . ' ' . $socio->apellidos);
            
            // Obtener el estado de cuenta del socio directamente
            $reportesController = app(\App\Http\Controllers\ReportesController::class);
            $estadoCuentaResponse = $reportesController->estadoSocio(request(), $socio->id);
            
            // Obtener los datos de la respuesta
            $responseData = $estadoCuentaResponse->getData();
            
            if (!$responseData || !$responseData->success) {
                \Log::error('Error al obtener estado de cuenta: ' . json_encode($responseData));
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener el estado de cuenta'
                ], 500);
            }
            
            $estadoCuenta = $responseData->data;
            \Log::info('Estado de cuenta obtenido exitosamente');
            
            // Verificar que la vista existe
            $viewPath = resource_path('views/reports/estado-cuenta-socio.blade.php');
            if (!file_exists($viewPath)) {
                \Log::error('Vista no encontrada: ' . $viewPath);
                return response()->json([
                    'success' => false,
                    'message' => 'Vista del PDF no encontrada'
                ], 500);
            }
            
            \Log::info('Generando PDF con DomPDF');
            // Generar PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.estado-cuenta-socio', [
                'socio' => $socio,
                'estadoCuenta' => $estadoCuenta
            ]);
            
            $pdf->setPaper('A4', 'portrait');
            
            $filename = "estado_cuenta_{$socio->cedula}_{$socio->nombres}_{$socio->apellidos}.pdf";
            $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename); // Limpiar caracteres especiales
            
            \Log::info('PDF generado exitosamente, descargando como: ' . $filename);
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            \Log::error('Error al generar PDF: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF del estado de cuenta',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Generar PDF del reporte de ahorros del socio
     */
    public function reporteAhorrosPDF(Socio $socio)
    {
        try {
            // Verificar que el socio existe
            $socio = Socio::findOrFail($socio->id);

            // Obtener datos de ahorros del socio
            $ahorrosResponse = app(\App\Http\Controllers\AhorroController::class)->index(request()->merge(['socio_id' => $socio->id]));
            $resumenResponse = app(\App\Http\Controllers\AhorroController::class)->resumenSocio($socio->id);

            $ahorrosData = $ahorrosResponse->getData();
            $resumenData = $resumenResponse->getData();

            if (!$ahorrosData->success || !$resumenData->success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener los datos de ahorros'
                ], 500);
            }

            // Generar PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.reporte-ahorros-socio', [
                'socio' => $socio,
                'ahorros' => $ahorrosData->data,
                'resumen' => $resumenData->data
            ]);

            $pdf->setPaper('A4', 'portrait');

            $filename = "reporte_ahorros_{$socio->cedula}_{$socio->nombres}_{$socio->apellidos}.pdf";
            $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);

            return $pdf->download($filename);

        } catch (\Exception $e) {
            \Log::error('Error al generar PDF de ahorros: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF de ahorros',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar PDF del reporte de préstamos del socio
     */
    public function reportePrestamosPDF(Socio $socio)
    {
        try {
            // Verificar que el socio existe
            $socio = Socio::findOrFail($socio->id);

            // Obtener datos de préstamos del socio
            $prestamosResponse = app(\App\Http\Controllers\PrestamoController::class)->index(request()->merge(['socio_id' => $socio->id]));

            $prestamosData = $prestamosResponse->getData();

            if (!$prestamosData->success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener los datos de préstamos'
                ], 500);
            }

            // Generar PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.reporte-prestamos-socio', [
                'socio' => $socio,
                'prestamos' => $prestamosData->data
            ]);

            $pdf->setPaper('A4', 'portrait');

            $filename = "reporte_prestamos_{$socio->cedula}_{$socio->nombres}_{$socio->apellidos}.pdf";
            $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);

            return $pdf->download($filename);

        } catch (\Exception $e) {
            \Log::error('Error al generar PDF de préstamos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el PDF de préstamos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

