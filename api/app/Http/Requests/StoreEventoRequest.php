<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo ADMIN y TESORERO pueden crear eventos
        return in_array($this->user()->rol, ['ADMIN', 'TESORERO']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'motivo' => ['required', 'string', 'max:1000'],
            'fecha_evento' => [
                'required',
                'date',
                'after:now',
                function ($attribute, $value, $fail) {
                    // Validar que la fecha no sea más de 2 años en el futuro
                    if (strtotime($value) > strtotime('+2 years')) {
                        $fail('La fecha del evento no puede ser más de 2 años en el futuro.');
                    }
                }
            ],
            'tipo_evento' => ['required', 'in:COMPARTIDO,CUBRE_ASOTEMA'],
            'precio_por_asistente' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'costo_por_asistente' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del evento es obligatorio.',
            'nombre.string' => 'El nombre debe ser un texto válido.',
            'nombre.max' => 'El nombre no puede exceder 255 caracteres.',
            
            'motivo.required' => 'El motivo del evento es obligatorio.',
            'motivo.string' => 'El motivo debe ser un texto válido.',
            'motivo.max' => 'El motivo no puede exceder 1000 caracteres.',
            
            'fecha_evento.required' => 'La fecha del evento es obligatoria.',
            'fecha_evento.date' => 'La fecha debe ser una fecha válida.',
            'fecha_evento.after' => 'La fecha del evento debe ser futura.',
            
            'tipo_evento.required' => 'El tipo de evento es obligatorio.',
            'tipo_evento.in' => 'El tipo de evento debe ser COMPARTIDO o CUBRE_ASOTEMA.',
            
            'precio_por_asistente.required' => 'El precio por asistente es obligatorio.',
            'precio_por_asistente.numeric' => 'El precio debe ser un número válido.',
            'precio_por_asistente.min' => 'El precio no puede ser negativo.',
            'precio_por_asistente.max' => 'El precio no puede exceder $999,999.99.',
            
            'costo_por_asistente.required' => 'El costo por asistente es obligatorio.',
            'costo_por_asistente.numeric' => 'El costo debe ser un número válido.',
            'costo_por_asistente.min' => 'El costo no puede ser negativo.',
            'costo_por_asistente.max' => 'El costo no puede exceder $999,999.99.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Asegurar que la fecha se interprete en timezone de Ecuador
        if ($this->has('fecha_evento')) {
            $fecha = $this->input('fecha_evento');
            if (is_string($fecha) && !str_contains($fecha, 'T')) {
                // Si es solo fecha, agregar hora por defecto
                $this->merge([
                    'fecha_evento' => $fecha . 'T00:00:00-05:00'
                ]);
            }
        }
    }
}