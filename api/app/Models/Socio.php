<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Socio extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'codigo',
        'cedula',
        'nombres',
        'apellidos',
        'telefono',
        'correo',
        'estado',
        'fecha_ingreso',
    ];

    protected $casts = [
        'fecha_ingreso' => 'date:Y-m-d',
    ];

    protected $appends = ['nombre_completo'];

    /**
     * Accessor para obtener el nombre completo
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombres} {$this->apellidos}";
    }

    /**
     * Relación con la cuenta del socio
     */
    public function cuenta()
    {
        return $this->morphOne(Cuenta::class, 'propietario', 'propietario_tipo', 'propietario_id')
            ->where('propietario_tipo', 'SOCIO');
    }

    /**
     * Generar código único para el socio (SOC-001 hasta SOC-999)
     */
    public static function generarCodigo()
    {
        $ultimoSocio = self::withTrashed()->orderBy('id', 'desc')->first();
        $numero = $ultimoSocio ? $ultimoSocio->id + 1 : 1;
        
        // Limitar a 999 socios
        if ($numero > 999) {
            throw new \Exception('Se ha alcanzado el límite máximo de socios (999)');
        }
        
        return 'SOC-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Scope para búsqueda
     */
    public function scopeSearch($query, $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('nombres', 'like', "%{$search}%")
              ->orWhere('apellidos', 'like', "%{$search}%")
              ->orWhere('cedula', 'like', "%{$search}%")
              ->orWhere('correo', 'like', "%{$search}%")
              ->orWhere('codigo', 'like', "%{$search}%");
        });
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeInactivos($query)
    {
        return $query->where('estado', 'INACTIVO');
    }

    /**
     * Relación con aportes de ahorro
     */
    public function aportesAhorro()
    {
        return $this->hasMany(AporteAhorro::class);
    }

    /**
     * Relación con préstamos
     */
    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }

    /**
     * Mutator para asegurar que fecha_ingreso se guarde correctamente
     */
    public function setFechaIngresoAttribute($value)
    {
        if (!$value) {
            $this->attributes['fecha_ingreso'] = null;
            return;
        }
        
        // Si viene como datetime, extraer solo la fecha
        if (strpos($value, ' ') !== false) {
            $value = explode(' ', $value)[0];
        }
        
        // Si viene como datetime con T, extraer solo la fecha
        if (strpos($value, 'T') !== false) {
            $value = explode('T', $value)[0];
        }
        
        // Asegurar que se guarde en zona horaria de Ecuador
        $this->attributes['fecha_ingreso'] = \Carbon\Carbon::createFromFormat('Y-m-d', $value, 'America/Guayaquil')->format('Y-m-d');
    }

    /**
     * Accessor para formatear fecha_ingreso en zona horaria de Ecuador
     */
    public function getFechaIngresoAttribute($value)
    {
        if (!$value) return null;
        
        // Si viene como datetime, extraer solo la fecha
        if (strpos($value, ' ') !== false) {
            $value = explode(' ', $value)[0];
        }
        
        return \Carbon\Carbon::createFromFormat('Y-m-d', $value, 'America/Guayaquil')->format('Y-m-d');
    }
}

