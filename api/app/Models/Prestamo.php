<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prestamo extends Model
{
    use HasFactory;

    protected $fillable = [
        'socio_id',
        'capital',
        'tasa_mensual',
        'plazo_meses',
        'fecha_inicio',
        'estado',
        'creado_por',
    ];

    protected $casts = [
        'capital' => 'decimal:2',
        'tasa_mensual' => 'decimal:4',
        'fecha_inicio' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Socio
     */
    public function socio()
    {
        return $this->belongsTo(Socio::class);
    }

    /**
     * Relación con Usuario que creó el préstamo
     */
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    /**
     * Relación con Cuotas
     */
    public function cuotas()
    {
        return $this->hasMany(CuotaPrestamo::class)->orderBy('numero_cuota');
    }

    /**
     * Scope para préstamos pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    /**
     * Scope para préstamos cancelados
     */
    public function scopeCancelados($query)
    {
        return $query->where('estado', 'CANCELADO');
    }

    /**
     * Scope para préstamos en mora
     */
    public function scopeMora($query)
    {
        return $query->where('estado', 'MORA');
    }

    /**
     * Scope para filtrar por socio
     */
    public function scopeSocio($query, $socioId)
    {
        return $query->where('socio_id', $socioId);
    }

    /**
     * Accessor para el monto total pagado
     */
    public function getMontoPagadoAttribute()
    {
        return $this->cuotas()->sum('monto_pagado');
    }

    /**
     * Accessor para el monto pendiente
     */
    public function getMontoPendienteAttribute()
    {
        $totalEsperado = $this->cuotas()->sum('monto_esperado');
        return $totalEsperado - $this->monto_pagado;
    }

    /**
     * Accessor para verificar si está pagado completamente
     */
    public function getCompletamentePagadoAttribute()
    {
        return $this->monto_pendiente <= 0;
    }

    /**
     * Accessor para formatear fecha_inicio en zona horaria de Ecuador
     */
    public function getFechaInicioAttribute($value)
    {
        if (!$value) return null;
        return \Carbon\Carbon::createFromFormat('Y-m-d', $value, 'America/Guayaquil')->format('Y-m-d');
    }
}