<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class JWTAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Log para debugging
            \Log::info('JWTAuthMiddleware: Verificando token para PDF', [
                'url' => $request->url(),
                'authorization' => $request->header('Authorization')
            ]);
            
            // Intentar obtener el token del header Authorization
            $token = JWTAuth::getToken();
            
            if (!$token) {
                \Log::warning('JWTAuthMiddleware: Token no proporcionado');
                return response()->json([
                    'success' => false,
                    'message' => 'Token no proporcionado'
                ], 401);
            }
            
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                \Log::warning('JWTAuthMiddleware: Usuario no encontrado');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 401);
            }
            
            \Log::info('JWTAuthMiddleware: Usuario autenticado exitosamente', ['user_id' => $user->id]);
            
            // Agregar el usuario autenticado al request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
        } catch (JWTException $e) {
            \Log::error('JWTAuthMiddleware: Error JWT', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Token no válido: ' . $e->getMessage()
            ], 401);
        } catch (\Exception $e) {
            \Log::error('JWTAuthMiddleware: Error general', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error de autenticación: ' . $e->getMessage()
            ], 401);
        }
        
        return $next($request);
    }
}
