<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cuenta extends Model
{
    use HasFactory;

    protected $fillable = [
        'propietario_tipo',
        'propietario_id',
        'nombre',
        'tipo',
    ];

    protected $casts = [
        'propietario_id' => 'integer',
    ];

    /**
     * Relación polimórfica con el propietario (Socio o ASOTEMA)
     */
    public function propietario()
    {
        return $this->morphTo('propietario', 'propietario_tipo', 'propietario_id');
    }

    /**
     * Scope para obtener la cuenta de ASOTEMA
     */
    public function scopeAsotema($query)
    {
        return $query->where('propietario_tipo', 'ASOTEMA')->whereNull('propietario_id');
    }

    /**
     * Scope para obtener cuentas de socios
     */
    public function scopeSocios($query)
    {
        return $query->where('propietario_tipo', 'SOCIO');
    }

    /**
     * Scope para obtener cuentas de ahorro
     */
    public function scopeAhorro($query)
    {
        return $query->where('tipo', 'AHORRO');
    }

    /**
     * Scope para obtener cuentas institucionales
     */
    public function scopeInstitucional($query)
    {
        return $query->where('tipo', 'INSTITUCIONAL');
    }

    /**
     * Scope para obtener cuentas corrientes
     */
    public function scopeCorriente($query)
    {
        return $query->where('tipo', 'CORRIENTE');
    }

    /**
     * Scope para obtener el fondo de ahorros ASOTEMA
     */
    public function scopeFondoAhorros($query)
    {
        return $query->where('propietario_tipo', 'ASOTEMA')
                    ->where('propietario_id', null)
                    ->where('tipo', 'INSTITUCIONAL')
                    ->where('nombre', 'Fondo de Ahorros ASOTEMA');
    }
}

