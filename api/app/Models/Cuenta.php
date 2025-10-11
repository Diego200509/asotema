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
}

