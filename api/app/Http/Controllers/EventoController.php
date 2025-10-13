<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Socio;
use App\Services\EventoService;
use App\Http\Requests\StoreEventoRequest;
use App\Http\Requests\UpdateEventoRequest;
use App\Http\Requests\AgregarAsistentesRequest;
use App\Http\Requests\ToggleAsistenciaRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EventoController extends Controller
{
    protected $eventoService;

    public function __construct(EventoService $eventoService)
    {
        $this->eventoService = $eventoService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Evento::with(['creadoPor', 'asistentes.socio'])
                ->orderBy('fecha_evento', 'desc');

            // Filtros
            if ($request->filled('desde')) {
                $query->where('fecha_evento', '>=', $request->desde);
            }

            if ($request->filled('hasta')) {
                $query->where('fecha_evento', '<=', $request->hasta);
            }

            if ($request->filled('q')) {
                $query->search($request->q);
            }

            if ($request->filled('tipo')) {
                $query->where('tipo_evento', $request->tipo);
            }

            if ($request->has('contabilizado')) {
                $contabilizado = filter_var($request->contabilizado, FILTER_VALIDATE_BOOLEAN);
                $query->where('contabilizado', $contabilizado);
            }

            // Paginación
            $perPage = $request->get('per_page', 15);
            $eventos = $query->paginate($perPage);

            // Agregar datos calculados
            $eventos->getCollection()->transform(function ($evento) {
                $evento->total_asistentes = $evento->total_asistentes;
                $evento->total_asistentes_confirmados = $evento->total_asistentes_confirmados;
                $evento->total_ingresos_potenciales = $evento->total_ingresos_potenciales;
                $evento->total_costos_potenciales = $evento->total_costos_potenciales;
                $evento->neto_potencial = $evento->neto_potencial;
                return $evento;
            });

            return response()->json([
                'success' => true,
                'data' => $eventos,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al listar eventos', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar la lista de eventos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventoRequest $request)
    {
        try {
            $evento = Evento::create([
                'nombre' => $request->nombre,
                'motivo' => $request->motivo,
                'fecha_evento' => $request->fecha_evento,
                'tipo_evento' => $request->tipo_evento,
                'precio_por_asistente' => $request->precio_por_asistente,
                'costo_por_asistente' => $request->costo_por_asistente,
                'creado_por' => auth()->id(),
            ]);

            $evento->load(['creadoPor']);

            return response()->json([
                'success' => true,
                'message' => 'Evento creado exitosamente',
                'data' => $evento,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear evento', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Evento $evento)
    {
        try {
            $evento->load([
                'creadoPor',
                'asistentes.socio.cuenta',
                'socios'
            ]);

            // Obtener resumen contable
            $resumen = $this->eventoService->obtenerResumenContable($evento);

            return response()->json([
                'success' => true,
                'data' => [
                    'evento' => $evento,
                    'resumen' => $resumen,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener evento', ['evento_id' => $evento->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventoRequest $request, Evento $evento)
    {
        try {
            // Verificar si se puede editar
            if (!$evento->sePuedeEditar()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede editar un evento que ya está contabilizado',
                ], 422);
            }

            $evento->update($request->validated());
            $evento->load(['creadoPor']);

            return response()->json([
                'success' => true,
                'message' => 'Evento actualizado exitosamente',
                'data' => $evento,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al actualizar evento', ['evento_id' => $evento->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evento $evento)
    {
        try {
            // Verificar si se puede eliminar
            if (!$evento->sePuedeEliminar()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar un evento que ya está contabilizado',
                ], 422);
            }

            $evento->delete();

            return response()->json([
                'success' => true,
                'message' => 'Evento eliminado exitosamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al eliminar evento', ['evento_id' => $evento->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Agregar asistentes a un evento
     */
    public function agregarAsistentes(AgregarAsistentesRequest $request, Evento $evento)
    {
        try {
            $resultado = $this->eventoService->agregarAsistentes($evento, $request->socio_ids);

            return response()->json([
                'success' => true,
                'message' => 'Asistentes agregados al evento',
                'data' => $resultado,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al agregar asistentes', ['evento_id' => $evento->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar asistentes al evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle asistencia de un socio
     */
    public function toggleAsistencia(ToggleAsistenciaRequest $request, Evento $evento)
    {
        try {
            $resultado = $this->eventoService->toggleAsistencia($evento, $request->socio_id, $request->asistio);

            return response()->json([
                'success' => true,
                'message' => 'Asistencia actualizada',
                'data' => $resultado,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al cambiar asistencia', [
                'evento_id' => $evento->id, 
                'socio_id' => $request->socio_id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar la asistencia',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Contabilizar un evento
     */
    public function contabilizar(Evento $evento)
    {
        try {
            // Verificar permisos
            if (!in_array(auth()->user()->rol, ['ADMIN', 'TESORERO'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para contabilizar eventos',
                ], 403);
            }

            $resultado = $this->eventoService->contabilizar($evento);

            return response()->json([
                'success' => true,
                'message' => 'Evento contabilizado exitosamente',
                'data' => $resultado,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al contabilizar evento', ['evento_id' => $evento->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al contabilizar el evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reversar contabilización de un evento
     */
    public function reversar(Evento $evento)
    {
        try {
            // Verificar permisos
            if (!in_array(auth()->user()->rol, ['ADMIN', 'TESORERO'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para revertir eventos',
                ], 403);
            }

            $resultado = $this->eventoService->reversar($evento);

            return response()->json([
                'success' => true,
                'message' => 'Evento revertido exitosamente',
                'data' => $resultado,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al revertir evento', ['evento_id' => $evento->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al revertir el evento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener socios para selección en eventos
     */
    public function sociosParaEvento(Request $request)
    {
        try {
            $query = Socio::with('cuenta')
                ->where('estado', 'ACTIVO')
                ->orderBy('apellidos')
                ->orderBy('nombres');

            // Búsqueda por nombre o cédula
            if ($request->filled('q')) {
                $search = $request->q;
                $query->where(function ($q) use ($search) {
                    $q->where('nombres', 'like', "%{$search}%")
                      ->orWhere('apellidos', 'like', "%{$search}%")
                      ->orWhere('cedula', 'like', "%{$search}%");
                });
            }

            // Si se solicita todos los socios
            if ($request->get('per_page') === 'all') {
                $socios = $query->get();
            } else {
                $perPage = $request->get('per_page', 15);
                $socios = $query->paginate($perPage);
            }

            return response()->json([
                'success' => true,
                'data' => $socios,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener socios para evento', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar la lista de socios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}