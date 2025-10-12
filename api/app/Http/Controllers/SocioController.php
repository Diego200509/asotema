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
}

