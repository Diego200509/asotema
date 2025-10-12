<?php

namespace App\Http\Controllers;

use App\Http\Requests\PrestamoStoreRequest;
use App\Http\Requests\PagoRequest;
use App\Services\PrestamoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PrestamoController extends Controller
{
    protected $prestamoService;

    public function __construct(PrestamoService $prestamoService)
    {
        $this->prestamoService = $prestamoService;
    }

    /**
     * Crear un nuevo préstamo
     */
    public function store(PrestamoStoreRequest $request): JsonResponse
    {
        try {
            $prestamo = $this->prestamoService->crearPrestamo(
                $request->socio_id,
                $request->capital,
                $request->plazo_meses,
                $request->fecha_inicio,
                $request->tasa_mensual
            );

            return response()->json([
                'success' => true,
                'message' => 'Préstamo creado exitosamente',
                'data' => $prestamo
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear préstamo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar préstamos con filtros
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filtros = [
                'socio_id' => $request->input('socio_id'),
                'estado' => $request->input('estado'),
                'search' => $request->input('q'),
                'per_page' => $request->input('per_page', 10)
            ];

            $prestamos = $this->prestamoService->obtenerPrestamos($filtros);

            return response()->json([
                'success' => true,
                'data' => $prestamos
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener préstamos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle de préstamo con cronograma
     */
    public function show(int $id): JsonResponse
    {
        try {
            $resultado = $this->prestamoService->obtenerDetallePrestamo($id);

            return response()->json([
                'success' => true,
                'data' => $resultado['prestamo'],
                'totales' => $resultado['totales']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener préstamo: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Registrar pago de cuota
     */
    public function pagar(PagoRequest $request, int $id): JsonResponse
    {
        try {
            $resultado = $this->prestamoService->pagarCuota(
                $id,
                $request->numero_cuota,
                $request->monto,
                auth()->id()
            );

            $mensaje = "Pago registrado exitosamente";
            if ($resultado['prestamo']->estado === 'CANCELADO') {
                $mensaje .= " - Préstamo cancelado completamente";
            }

            return response()->json([
                'success' => true,
                'message' => $mensaje,
                'data' => $resultado
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar pago: ' . $e->getMessage()
            ], 500);
        }
    }
}