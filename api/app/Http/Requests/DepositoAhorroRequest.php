<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepositoAhorroRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->rol, ['ADMIN', 'TESORERO']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'socio_id' => [
                'required',
                'integer',
                'exists:socios,id'
            ],
            'mes' => [
                'required',
                'date_format:Y-m',
                'before_or_equal:today'
            ],
            'fecha_operacion' => [
                'required',
                'date',
                'before_or_equal:today'
            ],
            'monto' => [
                'required',
                'numeric',
                'min:1',
                'max:10000'
            ],
            'notas' => [
                'nullable',
                'string',
                'max:255'
            ]
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
            'socio_id.required' => 'El socio es requerido.',
            'socio_id.integer' => 'El socio debe ser un número entero.',
            'socio_id.exists' => 'El socio seleccionado no existe.',
            'mes.required' => 'El mes es requerido.',
            'mes.date_format' => 'El mes debe tener el formato YYYY-MM.',
            'mes.before_or_equal' => 'El mes no puede ser posterior a hoy.',
            'fecha_operacion.required' => 'La fecha de operación es requerida.',
            'fecha_operacion.date' => 'La fecha de operación debe ser una fecha válida.',
            'fecha_operacion.before_or_equal' => 'La fecha de operación no puede ser posterior a hoy.',
            'monto.required' => 'El monto es requerido.',
            'monto.numeric' => 'El monto debe ser un número válido.',
            'monto.min' => 'El monto mínimo es $1.00.',
            'monto.max' => 'El monto máximo es $10,000.00.',
            'notas.string' => 'Las notas deben ser texto.',
            'notas.max' => 'Las notas no pueden exceder 255 caracteres.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Validar que el socio esté activo
        if ($this->has('socio_id')) {
            $socio = \App\Models\Socio::find($this->socio_id);
            if ($socio && $socio->estado !== 'ACTIVO') {
                $this->merge([
                    'socio_id' => null // Forzar error de validación
                ]);
            }
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Verificar que no exista un depósito para este socio en este mes
            if ($this->has('socio_id') && $this->has('mes')) {
                $existeAporte = \App\Models\AporteAhorro::where('socio_id', $this->socio_id)
                                                       ->where('mes', $this->mes . '-01')
                                                       ->where('tipo', 'DEPOSITO')
                                                       ->exists();

                if ($existeAporte) {
                    $validator->errors()->add('mes', 'Ya existe un depósito para este socio en el mes especificado.');
                }
            }
        });
    }
}