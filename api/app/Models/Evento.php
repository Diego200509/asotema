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
        'clase',
        'monto_ingreso',
        'tipo_evento',
        'valor_evento',
        'aporte_socio',
        'aporte_asotema',
        'costo_por_socio',
        'contabilizado',
        'creado_por',
    ];

    protected $casts = [
        'fecha_evento' => 'datetime',
        'monto_ingreso' => 'decimal:2',
        'valor_evento' => 'decimal:2',
        'aporte_socio' => 'decimal:2',
        'aporte_asotema' => 'decimal:2',
        'costo_por_socio' => 'decimal:2',
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
     * Scope para filtrar por clase de evento
     */
    public function scopePorClase($query, $clase)
    {
        return $query->where('clase', $clase);
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
        if ($this->clase === 'INGRESO') {
            return $this->monto_ingreso ?? 0;
        }
        
        if ($this->tipo_evento === 'COMPARTIDO') {
            return $this->total_asistentes_confirmados * $this->valor_evento;
        }
        
        if ($this->tipo_evento === 'CUBRE_ASOTEMA') {
            return $this->total_asistentes_confirmados * $this->costo_por_socio;
        }
        
        return 0;
    }

    /**
     * Accessor para obtener el total de costos potenciales
     */
    public function getTotalCostosPotencialesAttribute()
    {
        if ($this->clase === 'INGRESO') {
            return 0; // Los ingresos no tienen costos asociados
        }
        
        if ($this->tipo_evento === 'COMPARTIDO') {
            return $this->total_asistentes_confirmados * $this->aporte_asotema;
        }
        
        if ($this->tipo_evento === 'CUBRE_ASOTEMA') {
            return $this->total_asistentes_confirmados * $this->costo_por_socio;
        }
        
        return 0;
    }

    /**
     * Accessor para obtener el neto potencial
     */
    public function getNetoPotencialAttribute()
    {
        if ($this->clase === 'INGRESO') {
            return $this->monto_ingreso ?? 0;
        }
        
        if ($this->tipo_evento === 'COMPARTIDO') {
            return $this->total_asistentes_confirmados * $this->aporte_socio;
        }
        
        if ($this->tipo_evento === 'CUBRE_ASOTEMA') {
            return 0; // ASOTEMA no gana nada, solo cubre costos
        }
        
        return 0;
    }

    /**
     * Verificar si es un evento de ingreso
     */
    public function esIngreso()
    {
        return $this->clase === 'INGRESO';
    }

    /**
     * Verificar si es un evento de gasto
     */
    public function esGasto()
    {
        return $this->clase === 'GASTO';
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