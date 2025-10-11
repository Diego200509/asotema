<?php

namespace App\Http\Requests;

use App\Models\Socio;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PrestamoStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo ADMIN y TESORERO pueden crear préstamos
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
            'socio_id' => [
                'required',
                'integer',
                'exists:socios,id',
                function ($attribute, $value, $fail) {
                    $socio = Socio::find($value);
                    if ($socio && $socio->estado !== 'ACTIVO') {
                        $fail('El socio debe estar activo para recibir un préstamo.');
                    }
                }
            ],
            'capital' => [
                'required',
                'numeric',
                'min:100',
                'max:50000'
            ],
            'tasa_mensual' => [
                'nullable',
                'numeric',
                'min:0.001',
                'max:0.1'
            ],
            'plazo_meses' => [
                'required',
                'integer',
                Rule::in([3, 6, 9, 12])
            ],
            'fecha_inicio' => [
                'required',
                'date',
                'date_equals:today'
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
            'socio_id.exists' => 'El socio seleccionado no existe.',
            'capital.required' => 'El capital es requerido.',
            'capital.numeric' => 'El capital debe ser un número válido.',
            'capital.min' => 'El capital mínimo es $100.',
            'capital.max' => 'El capital máximo es $50,000.',
            'tasa_mensual.numeric' => 'La tasa mensual debe ser un número válido.',
            'tasa_mensual.min' => 'La tasa mensual mínima es 0.1%.',
            'tasa_mensual.max' => 'La tasa mensual máxima es 10%.',
            'plazo_meses.required' => 'El plazo en meses es requerido.',
            'plazo_meses.in' => 'El plazo debe ser 3, 6, 9 o 12 meses.',
            'fecha_inicio.required' => 'La fecha de inicio es requerida.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',
            'fecha_inicio.date_equals' => 'La fecha de inicio debe ser la fecha actual.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Si no se proporciona tasa_mensual, usar el default de 1%
        if (!$this->has('tasa_mensual') || $this->tasa_mensual === null) {
            $this->merge([
                'tasa_mensual' => 0.01
            ]);
        }
    }
}