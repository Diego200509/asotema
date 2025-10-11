<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepositoAhorroRequest;
use App\Http\Requests\DepositoLoteAhorroRequest;
use App\Http\Requests\RetiroAhorroRequest;
use App\Services\AhorroService;
use App\Models\AporteAhorro;
use App\Models\Socio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AhorroController extends Controller
{
    protected $ahorroService;

    public function __construct(AhorroService $ahorroService)
    {
        $this->ahorroService = $ahorroService;
    }

    /**
     * Listar aportes de ahorro con filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = AporteAhorro::with(['socio', 'registrador']);

        // Filtros
        if ($request->has('socio_id') && $request->socio_id) {
            $query->where('socio_id', $request->socio_id);
        }

        if ($request->has('mes') && $request->mes) {
            $query->where('mes', $request->mes . '-01');
        }

        if ($request->has('tipo') && $request->tipo) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('fecha_desde') && $request->fecha_desde) {
            $query->where('fecha_operacion', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta') && $request->fecha_hasta) {
            $query->where('fecha_operacion', '<=', $request->fecha_hasta);
        }

        // Búsqueda en nombres del socio
        if ($request->has('q') && $request->q) {
            $query->whereHas('socio', function ($q) use ($request) {
                $q->where('nombres', 'like', "%{$request->q}%")
                  ->orWhere('apellidos', 'like', "%{$request->q}%")
                  ->orWhere('cedula', 'like', "%{$request->q}%");
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_operacion');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $request->get('per_page', 15);
        $aportes = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $aportes,
            'message' => 'Aportes de ahorro obtenidos exitosamente'
        ]);
    }

    /**
     * Registrar un depósito de ahorro
     */
    public function deposito(DepositoAhorroRequest $request): JsonResponse
    {
        try {
            $aporte = $this->ahorroService->registrarDeposito(
                $request->socio_id,
                $request->mes,
                $request->fecha_operacion,
                $request->monto,
                auth()->id(),
                $request->notas
            );

            return response()->json([
                'success' => true,
                'data' => $aporte->load(['socio', 'registrador']),
                'message' => 'Depósito de ahorro registrado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Registrar depósitos en lote
     */
    public function depositoLote(DepositoLoteAhorroRequest $request): JsonResponse
    {
        try {
            $resultados = $this->ahorroService->registrarDepositoLote(
                $request->socio_ids,
                $request->mes,
                $request->fecha_operacion,
                $request->monto,
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'data' => $resultados,
                'message' => 'Procesamiento de depósitos en lote completado'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Registrar un retiro de ahorro
     */
    public function retiro(RetiroAhorroRequest $request): JsonResponse
    {
        try {
            $aporte = $this->ahorroService->registrarRetiro(
                $request->socio_id,
                $request->mes,
                $request->fecha_operacion,
                $request->monto,
                auth()->id(),
                $request->notas
            );

            return response()->json([
                'success' => true,
                'data' => $aporte->load(['socio', 'registrador']),
                'message' => 'Retiro de ahorro registrado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtener resumen de ahorros de un socio
     */
    public function resumenSocio(int $socioId): JsonResponse
    {
        try {
            $resumen = $this->ahorroService->obtenerResumenSocio($socioId);

            return response()->json([
                'success' => true,
                'data' => $resumen,
                'message' => 'Resumen de ahorros obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener saldo actual de ahorro de un socio
     */
    public function saldoSocio(int $socioId): JsonResponse
    {
        try {
            $saldo = $this->ahorroService->saldoAhorro($socioId);

            return response()->json([
                'success' => true,
                'data' => [
                    'socio_id' => $socioId,
                    'saldo' => $saldo
                ],
                'message' => 'Saldo obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Eliminar un aporte (soft delete con reversión contable)
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->ahorroService->eliminarAporte($id, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Aporte eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener socios para selección (endpoint de apoyo para frontend)
     */
    public function socios(Request $request): JsonResponse
    {
        $query = Socio::where('estado', 'ACTIVO');

        // Búsqueda
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('nombres', 'like', "%{$request->q}%")
                  ->orWhere('apellidos', 'like', "%{$request->q}%")
                  ->orWhere('cedula', 'like', "%{$request->q}%");
            });
        }

        // Ordenamiento
        $query->orderBy('apellidos', 'asc')->orderBy('nombres', 'asc');

        // Paginación
        if ($request->get('per_page') === 'all') {
            $socios = $query->get();
        } else {
            $perPage = $request->get('per_page', 15);
            $socios = $query->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'data' => $socios,
            'message' => 'Socios obtenidos exitosamente'
        ]);
    }

    /**
     * Obtener estadísticas generales de ahorros
     */
    public function estadisticas(): JsonResponse
    {
        try {
            // Total de depósitos y retiros
            $totalDepositos = AporteAhorro::where('tipo', 'DEPOSITO')->sum('monto');
            $totalRetiros = AporteAhorro::where('tipo', 'RETIRO')->sum('monto');
            $totalAportes = AporteAhorro::count();

            // Socios con ahorros
            $sociosConAhorros = AporteAhorro::distinct('socio_id')->count('socio_id');

            // Aportes por mes (últimos 12 meses)
            $aportesPorMes = AporteAhorro::selectRaw('
                DATE_FORMAT(mes, "%Y-%m") as mes,
                SUM(CASE WHEN tipo = "DEPOSITO" THEN monto ELSE 0 END) as depositos,
                SUM(CASE WHEN tipo = "RETIRO" THEN monto ELSE 0 END) as retiros,
                COUNT(*) as total_aportes
            ')
            ->where('mes', '>=', now()->subMonths(12)->startOfMonth())
            ->groupBy('mes')
            ->orderBy('mes', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'totales' => [
                        'total_depositos' => (float) $totalDepositos,
                        'total_retiros' => (float) $totalRetiros,
                        'saldo_general' => (float) $totalDepositos - (float) $totalRetiros,
                        'total_aportes' => $totalAportes,
                        'socios_con_ahorros' => $sociosConAhorros
                    ],
                    'aportes_por_mes' => $aportesPorMes
                ],
                'message' => 'Estadísticas obtenidas exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}