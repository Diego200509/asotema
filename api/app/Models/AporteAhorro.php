<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class AporteAhorro extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'aportes_ahorro';

    protected $fillable = [
        'socio_id',
        'mes',
        'fecha_operacion',
        'tipo',
        'monto',
        'notas',
        'registrado_por',
    ];

    protected $casts = [
        'mes' => 'date:Y-m-d',
        'fecha_operacion' => 'date:Y-m-d',
        'monto' => 'decimal:2',
        'socio_id' => 'integer',
        'registrado_por' => 'integer',
    ];

    /**
     * Relación con el socio
     */
    public function socio()
    {
        return $this->belongsTo(Socio::class);
    }

    /**
     * Relación con el usuario que registró el aporte
     */
    public function registrador()
    {
        return $this->belongsTo(Usuario::class, 'registrado_por');
    }

    /**
     * Scope para obtener aportes por socio
     */
    public function scopeBySocio($query, $socioId)
    {
        return $query->where('socio_id', $socioId);
    }

    /**
     * Scope para obtener aportes por mes
     */
    public function scopeByMes($query, $mes)
    {
        return $query->where('mes', $mes);
    }

    /**
     * Scope para obtener depósitos
     */
    public function scopeDepositos($query)
    {
        return $query->where('tipo', 'DEPOSITO');
    }

    /**
     * Scope para obtener retiros
     */
    public function scopeRetiros($query)
    {
        return $query->where('tipo', 'RETIRO');
    }

    /**
     * Scope para obtener aportes de un rango de fechas
     */
    public function scopeByFechaOperacion($query, $fechaInicio, $fechaFin = null)
    {
        $query->where('fecha_operacion', '>=', $fechaInicio);
        
        if ($fechaFin) {
            $query->where('fecha_operacion', '<=', $fechaFin);
        }
        
        return $query;
    }

    /**
     * Accessor para obtener el mes formateado correctamente
     */
    public function getMesAttribute($value)
    {
        if (!$value) return null;
        return \Carbon\Carbon::createFromFormat('Y-m-d', $value, 'America/Guayaquil')->format('Y-m-d');
    }

    /**
     * Accessor para obtener la fecha de operación formateada correctamente
     */
    public function getFechaOperacionAttribute($value)
    {
        if (!$value) return null;
        return \Carbon\Carbon::createFromFormat('Y-m-d', $value, 'America/Guayaquil')->format('Y-m-d');
    }

    /**
     * Accessor para formatear el mes (mantener compatibilidad)
     */
    public function getMesFormateadoAttribute()
    {
        return Carbon::parse($this->mes)->format('Y-m');
    }

    /**
     * Accessor para el tipo formateado
     */
    public function getTipoFormateadoAttribute()
    {
        return $this->tipo === 'DEPOSITO' ? 'Depósito' : 'Retiro';
    }

    /**
     * Verificar si existe un aporte para un socio en un mes específico
     */
    public static function existeAporteEnMes($socioId, $mes, $tipo = null)
    {
        $query = static::where('socio_id', $socioId)
                      ->where('mes', $mes);
        
        if ($tipo) {
            $query->where('tipo', $tipo);
        }
        
        return $query->exists();
    }

    /**
     * Obtener el total de aportes de un socio en un mes
     */
    public static function totalAportesEnMes($socioId, $mes, $tipo = null)
    {
        $query = static::where('socio_id', $socioId)
                      ->where('mes', $mes);
        
        if ($tipo) {
            $query->where('tipo', $tipo);
        }
        
        return $query->sum('monto');
    }
}