<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    /**
     * Listar todos los usuarios (con paginación y búsqueda).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Usuario::query();

        // Búsqueda por nombre o correo
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('correo', 'like', "%{$search}%");
            });
        }

        // Filtro por rol
        if ($request->has('rol') && $request->rol != '') {
            $query->where('rol', $request->rol);
        }

        // Filtro por estado activo
        if ($request->has('activo') && $request->activo !== '') {
            $query->where('activo', $request->activo);
        }

        // Paginación
        $perPage = $request->input('per_page', 6);
        $usuarios = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $usuarios
        ], 200);
    }

    /**
     * Crear un nuevo usuario.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|unique:usuarios,correo',
            'password' => 'required|string|min:6',
            'rol' => 'required|in:ADMIN,CAJERO,TESORERO',
            'activo' => 'boolean',
        ]);

        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
            'password' => $request->password, // Texto plano para desarrollo
            'rol' => $request->rol,
            'activo' => $request->input('activo', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data' => $usuario
        ], 201);
    }

    /**
     * Mostrar un usuario específico.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $usuario
        ], 200);
    }

    /**
     * Actualizar un usuario existente.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'correo' => 'sometimes|required|email|unique:usuarios,correo,' . $id,
            'password' => 'sometimes|nullable|string|min:6',
            'rol' => 'sometimes|required|in:ADMIN,CAJERO,TESORERO',
            'activo' => 'sometimes|boolean',
        ]);

        // Actualizar solo los campos enviados
        if ($request->has('nombre')) {
            $usuario->nombre = $request->nombre;
        }
        if ($request->has('correo')) {
            $usuario->correo = $request->correo;
        }
        if ($request->has('password') && $request->password != '') {
            $usuario->password = $request->password; // Texto plano para desarrollo
        }
        if ($request->has('rol')) {
            $usuario->rol = $request->rol;
        }
        if ($request->has('activo')) {
            $usuario->activo = $request->activo;
        }

        $usuario->save();

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'data' => $usuario
        ], 200);
    }

    /**
     * Eliminar un usuario (soft delete).
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $usuario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado exitosamente'
        ], 200);
    }
}

