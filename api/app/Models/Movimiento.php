<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    use HasFactory;

    protected $fillable = [
        'cuenta_id',
        'tipo',
        'monto',
        'ref_tipo',
        'ref_id',
        'descripcion',
        'creado_por',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Cuenta
     */
    public function cuenta()
    {
        return $this->belongsTo(Cuenta::class);
    }

    /**
     * Relación con Usuario que creó el movimiento
     */
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    /**
     * Scope para movimientos DEBE
     */
    public function scopeDebe($query)
    {
        return $query->where('tipo', 'DEBE');
    }

    /**
     * Scope para movimientos HABER
     */
    public function scopeHaber($query)
    {
        return $query->where('tipo', 'HABER');
    }

    /**
     * Scope para filtrar por tipo de referencia
     */
    public function scopeRefTipo($query, $refTipo)
    {
        return $query->where('ref_tipo', $refTipo);
    }

    /**
     * Scope para filtrar por cuenta
     */
    public function scopeCuenta($query, $cuentaId)
    {
        return $query->where('cuenta_id', $cuentaId);
    }
}