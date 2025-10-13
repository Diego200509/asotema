<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Evento extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'motivo',
        'fecha_evento',
        'tipo_evento',
        'precio_por_asistente',
        'costo_por_asistente',
        'contabilizado',
        'creado_por',
    ];

    protected $casts = [
        'fecha_evento' => 'datetime',
        'precio_por_asistente' => 'decimal:2',
        'costo_por_asistente' => 'decimal:2',
        'contabilizado' => 'boolean',
        'creado_por' => 'integer',
    ];

    /**
     * Relación con el usuario que creó el evento
     */
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    /**
     * Relación con los asistentes del evento
     */
    public function asistentes()
    {
        return $this->hasMany(AsistenteEvento::class);
    }

    /**
     * Relación con los socios a través de asistentes
     */
    public function socios()
    {
        return $this->belongsToMany(Socio::class, 'asistentes_evento', 'evento_id', 'socio_id')
                    ->withPivot('asistio', 'created_at')
                    ->withTimestamps();
    }

    /**
     * Obtener asistentes que realmente asistieron
     */
    public function asistentesConfirmados()
    {
        return $this->hasMany(AsistenteEvento::class)->where('asistio', true);
    }

    /**
     * Scope para eventos contabilizados
     */
    public function scopeContabilizados($query)
    {
        return $query->where('contabilizado', true);
    }

    /**
     * Scope para eventos no contabilizados
     */
    public function scopeNoContabilizados($query)
    {
        return $query->where('contabilizado', false);
    }

    /**
     * Scope para filtrar por tipo de evento
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_evento', $tipo);
    }

    /**
     * Scope para filtrar por rango de fechas
     */
    public function scopePorFecha($query, $desde, $hasta)
    {
        if ($desde) {
            $query->where('fecha_evento', '>=', $desde);
        }
        if ($hasta) {
            $query->where('fecha_evento', '<=', $hasta);
        }
        return $query;
    }

    /**
     * Scope para búsqueda por nombre o motivo
     */
    public function scopeSearch($query, $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('nombre', 'like', "%{$search}%")
              ->orWhere('motivo', 'like', "%{$search}%");
        });
    }

    /**
     * Accessor para obtener el total de asistentes
     */
    public function getTotalAsistentesAttribute()
    {
        return $this->asistentes()->count();
    }

    /**
     * Accessor para obtener el total de asistentes confirmados
     */
    public function getTotalAsistentesConfirmadosAttribute()
    {
        return $this->asistentes()->where('asistio', true)->count();
    }

    /**
     * Accessor para obtener el total de ingresos potenciales
     */
    public function getTotalIngresosPotencialesAttribute()
    {
        return $this->total_asistentes_confirmados * $this->precio_por_asistente;
    }

    /**
     * Accessor para obtener el total de costos potenciales
     */
    public function getTotalCostosPotencialesAttribute()
    {
        return $this->total_asistentes_confirmados * $this->costo_por_asistente;
    }

    /**
     * Accessor para obtener el neto potencial
     */
    public function getNetoPotencialAttribute()
    {
        return $this->total_ingresos_potenciales - $this->total_costos_potenciales;
    }

    /**
     * Verificar si el evento se puede editar
     */
    public function sePuedeEditar()
    {
        return !$this->contabilizado;
    }

    /**
     * Verificar si el evento se puede eliminar
     */
    public function sePuedeEliminar()
    {
        return !$this->contabilizado;
    }

    /**
     * Formatear fecha para Ecuador
     */
    public function getFechaEventoEcuadorAttribute()
    {
        return $this->fecha_evento->setTimezone('America/Guayaquil');
    }

    /**
     * Boot del modelo para configurar timezone
     */
    protected static function boot()
    {
        parent::boot();
        
        // Configurar timezone para Ecuador al crear/actualizar
        static::creating(function ($evento) {
            if ($evento->fecha_evento && is_string($evento->fecha_evento)) {
                $evento->fecha_evento = Carbon::parse($evento->fecha_evento, 'America/Guayaquil');
            }
        });

        static::updating(function ($evento) {
            if ($evento->isDirty('fecha_evento') && is_string($evento->fecha_evento)) {
                $evento->fecha_evento = Carbon::parse($evento->fecha_evento, 'America/Guayaquil');
            }
        });
    }
}