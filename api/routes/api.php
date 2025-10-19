<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\SocioController;
use App\Http\Controllers\PrestamoController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\AhorroController;
use App\Http\Controllers\EventoController;
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

    // Rutas para generar PDFs (fuera del grupo auth:api)
    Route::get('/socios/{socio}/estado-cuenta/pdf', [SocioController::class, 'estadoCuentaPDF'])->middleware('jwt.auth');
    Route::get('/socios/{socio}/reporte-ahorros/pdf', [SocioController::class, 'reporteAhorrosPDF'])->middleware('jwt.auth');
    Route::get('/socios/{socio}/reporte-prestamos/pdf', [SocioController::class, 'reportePrestamosPDF'])->middleware('jwt.auth');
    Route::get('/reportes/descuentos-mensuales/preview', [ReportesController::class, 'descuentosMensualesPreview'])->middleware('jwt.auth');

    // Rutas CRUD de préstamos
    Route::prefix('prestamos')->group(function () {
        // Lectura para todos los roles autenticados
        Route::get('/', [PrestamoController::class, 'index']);
        Route::get('/{id}', [PrestamoController::class, 'show']);

        // Crear préstamos solo para ADMIN y TESORERO
        Route::middleware(['role:ADMIN,TESORERO'])->group(function () {
            Route::post('/', [PrestamoController::class, 'store']);
        });

        // Registrar pagos para ADMIN, TESORERO y CAJERO
        Route::middleware(['role:ADMIN,TESORERO,CAJERO'])->group(function () {
            Route::post('/{prestamo}/pagar', [PrestamoController::class, 'pagar']);
        });
    });

    // Rutas de reportes
    Route::prefix('reportes')->group(function () {
        // Reportes para todos los roles autenticados
        Route::get('/socio/{socioId}/estado', [ReportesController::class, 'estadoSocio']);
        
        // Reportes administrativos solo para ADMIN y TESORERO
        Route::middleware(['role:ADMIN,TESORERO'])->group(function () {
            Route::get('/cartera-prestamos', [ReportesController::class, 'carteraPrestamos']);
            Route::get('/ingresos-intereses', [ReportesController::class, 'ingresosIntereses']);
            
            // Descuentos mensuales
            Route::get('/descuentos-mensuales/meses', [ReportesController::class, 'descuentosMensualesMeses']);
            Route::get('/descuentos-mensuales', [ReportesController::class, 'descuentosMensuales']);
            Route::get('/descuentos-mensuales/pdf', [ReportesController::class, 'descuentosMensualesPdf']);
        });
    });

    // Rutas CRUD de ahorros
    Route::prefix('ahorros')->group(function () {
        // Lectura para todos los roles autenticados
        Route::get('/', [AhorroController::class, 'index']);
        Route::get('/estadisticas', [AhorroController::class, 'estadisticas']);
        Route::get('/socios', [AhorroController::class, 'socios']);
        Route::get('/socio/{socioId}/resumen', [AhorroController::class, 'resumenSocio']);
        Route::get('/socio/{socioId}/saldo', [AhorroController::class, 'saldoSocio']);

        // Crear, editar y eliminar solo para ADMIN y TESORERO
        Route::middleware(['role:ADMIN,TESORERO'])->group(function () {
            Route::post('/deposito', [AhorroController::class, 'deposito']);
            Route::post('/deposito-lote', [AhorroController::class, 'depositoLote']);
            Route::post('/retiro', [AhorroController::class, 'retiro']);
            Route::delete('/{id}', [AhorroController::class, 'destroy']);
        });
    });

    // Rutas CRUD de eventos
    Route::prefix('eventos')->group(function () {
        // Lectura para todos los roles autenticados
        Route::get('/', [EventoController::class, 'index']);
        Route::get('/socios/para-evento', [EventoController::class, 'sociosParaEvento']);
        Route::get('/{evento}', [EventoController::class, 'show']);

        // Crear, editar y eliminar solo para ADMIN y TESORERO
        Route::middleware(['role:ADMIN,TESORERO'])->group(function () {
            Route::post('/', [EventoController::class, 'store']);
            Route::put('/{evento}', [EventoController::class, 'update']);
            Route::delete('/{evento}', [EventoController::class, 'destroy']);
            Route::post('/{evento}/asistentes', [EventoController::class, 'agregarAsistentes']);
            Route::post('/{evento}/contabilizar', [EventoController::class, 'contabilizar']);
            Route::post('/{evento}/reversar', [EventoController::class, 'reversar']);
        });

        // Marcar asistencia para ADMIN, TESORERO y CAJERO
        Route::middleware(['role:ADMIN,TESORERO,CAJERO'])->group(function () {
            Route::post('/{evento}/toggle-asistencia', [EventoController::class, 'toggleAsistencia']);
        });
    });
});

