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
        $rules = [
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
            'clase' => ['required', 'in:INGRESO,GASTO'],
        ];

        // Validaciones específicas por clase
        if ($this->input('clase') === 'INGRESO') {
            $rules['monto_ingreso'] = ['required', 'numeric', 'min:0.01', 'max:999999.99'];
        } else {
            $rules['tipo_evento'] = ['required', 'in:COMPARTIDO,CUBRE_ASOTEMA'];
            
            // Validaciones específicas por tipo de evento
            if ($this->input('tipo_evento') === 'COMPARTIDO') {
                $rules['aporte_socio'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
                $rules['aporte_asotema'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            } elseif ($this->input('tipo_evento') === 'CUBRE_ASOTEMA') {
                $rules['costo_por_socio'] = ['required', 'numeric', 'min:0.01', 'max:999999.99'];
            }
        }

        return $rules;
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
            
            'clase.required' => 'La clase del evento es obligatoria.',
            'clase.in' => 'La clase debe ser INGRESO o GASTO.',
            
            'monto_ingreso.required' => 'El monto de ingreso es obligatorio para eventos de INGRESO.',
            'monto_ingreso.numeric' => 'El monto debe ser un número válido.',
            'monto_ingreso.min' => 'El monto debe ser mayor a 0.',
            'monto_ingreso.max' => 'El monto no puede exceder $999,999.99.',
            
            'tipo_evento.required' => 'El tipo de evento es obligatorio para eventos de GASTO.',
            'tipo_evento.in' => 'El tipo de evento debe ser COMPARTIDO o CUBRE_ASOTEMA.',
            
            // Mensajes para COMPARTIDO
            'aporte_socio.required' => 'El aporte del socio es obligatorio para eventos COMPARTIDO.',
            'aporte_socio.numeric' => 'El aporte del socio debe ser un número válido.',
            'aporte_socio.min' => 'El aporte del socio no puede ser negativo.',
            'aporte_socio.max' => 'El aporte del socio no puede exceder $999,999.99.',
            
            'aporte_asotema.required' => 'El aporte de ASOTEMA es obligatorio para eventos COMPARTIDO.',
            'aporte_asotema.numeric' => 'El aporte de ASOTEMA debe ser un número válido.',
            'aporte_asotema.min' => 'El aporte de ASOTEMA no puede ser negativo.',
            'aporte_asotema.max' => 'El aporte de ASOTEMA no puede exceder $999,999.99.',
            
            // Mensajes para CUBRE_ASOTEMA
            'costo_por_socio.required' => 'El costo por socio es obligatorio para eventos CUBRE_ASOTEMA.',
            'costo_por_socio.numeric' => 'El costo por socio debe ser un número válido.',
            'costo_por_socio.min' => 'El costo por socio debe ser mayor a 0.',
            'costo_por_socio.max' => 'El costo por socio no puede exceder $999,999.99.',
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