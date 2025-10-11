<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\SocioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas de autenticación (públicas)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas protegidas con JWT
Route::middleware(['auth:api'])->group(function () {
    // Rutas de autenticación
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    
    // Obtener datos del usuario autenticado
    Route::get('/me', [AuthController::class, 'me']);

    // Rutas CRUD de usuarios (solo ADMIN)
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::prefix('usuarios')->group(function () {
            Route::get('/', [UsuarioController::class, 'index']);
            Route::post('/', [UsuarioController::class, 'store']);
            Route::get('/{id}', [UsuarioController::class, 'show']);
            Route::put('/{id}', [UsuarioController::class, 'update']);
            Route::delete('/{id}', [UsuarioController::class, 'destroy']);
        });
    });

    // Rutas CRUD de socios
    Route::prefix('socios')->group(function () {
        // Lectura para todos los roles autenticados
        Route::get('/', [SocioController::class, 'index']);
        Route::get('/{socio}', [SocioController::class, 'show']);

        // Crear, editar y eliminar solo para ADMIN y TESORERO
        Route::middleware(['role:ADMIN,TESORERO'])->group(function () {
            Route::post('/', [SocioController::class, 'store']);
            Route::put('/{socio}', [SocioController::class, 'update']);
            Route::delete('/{socio}', [SocioController::class, 'destroy']);
        });
    });
});

