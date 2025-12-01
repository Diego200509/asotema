<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Login de usuario y generación de JWT.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required|string',
        ]);

        // Buscar usuario por correo
        $usuario = Usuario::where('correo', $request->correo)->first();

        // Validar que el usuario existe, está activo y la contraseña coincide
        if (!$usuario || !$usuario->activo || $usuario->password !== $request->password) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas o usuario inactivo'
            ], 401);
        }

        // Generar token JWT y refresh token
        $token = JWTAuth::fromUser($usuario);
        $refreshToken = JWTAuth::customClaims(['type' => 'refresh'])->fromUser($usuario);

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'token' => $token,
                'refresh_token' => $refreshToken,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60, // en segundos
                'usuario' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'correo' => $usuario->correo,
                    'rol' => $usuario->rol,
                    'activo' => $usuario->activo,
                ]
            ]
        ], 200);
    }

    /**
     * Logout de usuario (invalida el token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            
            return response()->json([
                'success' => true,
                'message' => 'Logout exitoso'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión'
            ], 500);
        }
    }

    /**
     * Obtener datos del usuario autenticado.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        try {
            $usuario = JWTAuth::parseToken()->authenticate();
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'correo' => $usuario->correo,
                    'rol' => $usuario->rol,
                    'activo' => $usuario->activo,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido o expirado'
            ], 401);
        }
    }

    /**
     * Refrescar token JWT usando refresh token.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request)
    {
        try {
            $request->validate([
                'refresh_token' => 'required|string',
            ]);

            // Intentar autenticar con el refresh token
            $token = $request->input('refresh_token');
            $usuario = JWTAuth::setToken($token)->authenticate();

            if (!$usuario || !$usuario->activo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de refresco inválido o usuario inactivo'
                ], 401);
            }

            // Invalidar el refresh token anterior
            JWTAuth::invalidate(JWTAuth::setToken($token)->getToken());

            // Generar nuevo token y refresh token
            $newToken = JWTAuth::fromUser($usuario);
            $newRefreshToken = JWTAuth::customClaims(['type' => 'refresh'])->fromUser($usuario);

            return response()->json([
                'success' => true,
                'message' => 'Token refrescado exitosamente',
                'data' => [
                    'token' => $newToken,
                    'refresh_token' => $newRefreshToken,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60, // en segundos
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al refrescar el token'
            ], 401);
        }
    }
}

