<?php

namespace App\Http\Requests;

use App\Models\CuotaPrestamo;
use Illuminate\Foundation\Http\FormRequest;

class PagoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // ADMIN, TESORERO y CAJERO pueden registrar pagos
        return in_array($this->user()->rol, ['ADMIN', 'TESORERO', 'CAJERO']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $prestamoId = $this->route('prestamo');
        
        return [
            'numero_cuota' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) use ($prestamoId) {
                    $cuota = CuotaPrestamo::where('prestamo_id', $prestamoId)
                        ->where('numero_cuota', $value)
                        ->first();
                    
                    if (!$cuota) {
                        $fail('La cuota especificada no existe para este préstamo.');
                    }
                }
            ],
            'monto' => [
                'required',
                'numeric',
                'min:0.01',
                'max:10000'
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
            'numero_cuota.required' => 'El número de cuota es requerido.',
            'numero_cuota.integer' => 'El número de cuota debe ser un número entero.',
            'numero_cuota.min' => 'El número de cuota debe ser mayor a 0.',
            'monto.required' => 'El monto del pago es requerido.',
            'monto.numeric' => 'El monto debe ser un número válido.',
            'monto.min' => 'El monto mínimo es $0.01.',
            'monto.max' => 'El monto máximo es $10,000.',
        ];
    }
}