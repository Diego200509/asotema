<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CuotaPrestamo extends Model
{
    use HasFactory;

    protected $table = 'cuotas_prestamo';

    protected $fillable = [
        'prestamo_id',
        'numero_cuota',
        'fecha_vencimiento',
        'monto_esperado',
        'parte_interes',
        'parte_capital',
        'monto_pagado',
        'pagada_en',
        'estado',
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
        'monto_esperado' => 'decimal:2',
        'parte_interes' => 'decimal:2',
        'parte_capital' => 'decimal:2',
        'monto_pagado' => 'decimal:2',
        'pagada_en' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Préstamo
     */
    public function prestamo()
    {
        return $this->belongsTo(Prestamo::class);
    }

    /**
     * Scope para cuotas pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    /**
     * Scope para cuotas pagadas
     */
    public function scopePagadas($query)
    {
        return $query->where('estado', 'PAGADA');
    }

    /**
     * Scope para cuotas parciales
     */
    public function scopeParciales($query)
    {
        return $query->where('estado', 'PARCIAL');
    }

    /**
     * Scope para filtrar por préstamo
     */
    public function scopePrestamo($query, $prestamoId)
    {
        return $query->where('prestamo_id', $prestamoId);
    }

    /**
     * Scope para cuotas vencidas
     */
    public function scopeVencidas($query)
    {
        return $query->where('fecha_vencimiento', '<', now()->toDateString())
                    ->whereIn('estado', ['PENDIENTE', 'PARCIAL']);
    }

    /**
     * Accessor para el monto pendiente de la cuota
     */
    public function getMontoPendienteAttribute()
    {
        return $this->monto_esperado - $this->monto_pagado;
    }

    /**
     * Accessor para verificar si está pagada completamente
     */
    public function getCompletamentePagadaAttribute()
    {
        return $this->monto_pagado >= $this->monto_esperado;
    }

    /**
     * Accessor para verificar si está vencida
     */
    public function getVencidaAttribute()
    {
        return $this->fecha_vencimiento < now()->toDateString() && 
               !$this->completamente_pagada;
    }
}