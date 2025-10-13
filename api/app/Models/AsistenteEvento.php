<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AsistenteEvento extends Model
{
    use HasFactory;

    protected $table = 'asistentes_evento';

    protected $fillable = [
        'evento_id',
        'socio_id',
        'asistio',
    ];

    protected $casts = [
        'evento_id' => 'integer',
        'socio_id' => 'integer',
        'asistio' => 'boolean',
    ];

    /**
     * Relación con el evento
     */
    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    /**
     * Relación con el socio
     */
    public function socio()
    {
        return $this->belongsTo(Socio::class);
    }

    /**
     * Scope para asistentes confirmados
     */
    public function scopeConfirmados($query)
    {
        return $query->where('asistio', true);
    }

    /**
     * Scope para asistentes no confirmados
     */
    public function scopeNoConfirmados($query)
    {
        return $query->where('asistio', false);
    }

    /**
     * Toggle del estado de asistencia
     */
    public function toggleAsistencia()
    {
        $this->update(['asistio' => !$this->asistio]);
        return $this;
    }
}