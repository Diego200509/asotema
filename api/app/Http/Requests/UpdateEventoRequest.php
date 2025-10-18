<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo ADMIN y TESORERO pueden editar eventos
        return in_array($this->user()->rol, ['ADMIN', 'TESORERO']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $evento = $this->route('evento');
        
        // Si el evento está contabilizado, solo permitir campos específicos
        if ($evento && $evento->contabilizado) {
            return [
                // Solo se pueden actualizar campos no críticos si está contabilizado
                'motivo' => ['sometimes', 'string', 'max:1000'],
            ];
        }

        $rules = [
            'nombre' => ['sometimes', 'string', 'max:255'],
            'motivo' => ['sometimes', 'string', 'max:1000'],
            'fecha_evento' => [
                'sometimes',
                'date',
                'after:now',
                function ($attribute, $value, $fail) {
                    if (strtotime($value) > strtotime('+2 years')) {
                        $fail('La fecha del evento no puede ser más de 2 años en el futuro.');
                    }
                }
            ],
        ];

        // Validaciones específicas por clase
        if ($evento && $evento->clase === 'INGRESO') {
            $rules['monto_ingreso'] = ['sometimes', 'numeric', 'min:0.01', 'max:999999.99'];
        } else {
            $rules['tipo_evento'] = ['sometimes', 'in:COMPARTIDO,CUBRE_ASOTEMA'];
            $rules['precio_por_asistente'] = ['sometimes', 'numeric', 'min:0', 'max:999999.99'];
            $rules['costo_por_asistente'] = ['sometimes', 'numeric', 'min:0', 'max:999999.99'];
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
            'nombre.string' => 'El nombre debe ser un texto válido.',
            'nombre.max' => 'El nombre no puede exceder 255 caracteres.',
            
            'motivo.string' => 'El motivo debe ser un texto válido.',
            'motivo.max' => 'El motivo no puede exceder 1000 caracteres.',
            
            'fecha_evento.date' => 'La fecha debe ser una fecha válida.',
            'fecha_evento.after' => 'La fecha del evento debe ser futura.',
            
            'monto_ingreso.numeric' => 'El monto debe ser un número válido.',
            'monto_ingreso.min' => 'El monto debe ser mayor a 0.',
            'monto_ingreso.max' => 'El monto no puede exceder $999,999.99.',
            
            'tipo_evento.in' => 'El tipo de evento debe ser COMPARTIDO o CUBRE_ASOTEMA.',
            
            'precio_por_asistente.numeric' => 'El precio debe ser un número válido.',
            'precio_por_asistente.min' => 'El precio no puede ser negativo.',
            'precio_por_asistente.max' => 'El precio no puede exceder $999,999.99.',
            
            'costo_por_asistente.numeric' => 'El costo debe ser un número válido.',
            'costo_por_asistente.min' => 'El costo no puede ser negativo.',
            'costo_por_asistente.max' => 'El costo no puede exceder $999,999.99.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $evento = $this->route('evento');
            
            if ($evento && $evento->contabilizado) {
                // Si está contabilizado, verificar que solo se esté editando motivo
                $camposEditables = ['motivo'];
                $camposSolicitados = array_keys($this->validated());
                
                foreach ($camposSolicitados as $campo) {
                    if (!in_array($campo, $camposEditables)) {
                        $validator->errors()->add($campo, 'Este campo no se puede editar porque el evento ya está contabilizado. Solo se puede editar el motivo.');
                    }
                }
            }
        });
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
                $this->merge([
                    'fecha_evento' => $fecha . 'T00:00:00-05:00'
                ]);
            }
        }
    }
}