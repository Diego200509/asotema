<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AgregarAsistentesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo ADMIN y TESORERO pueden agregar asistentes
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
            'socio_ids' => [
                'required',
                'array',
                'min:1',
                'max:100', // Límite razonable para agregar asistentes de una vez
            ],
            'socio_ids.*' => [
                'required',
                'integer',
                'exists:socios,id',
                'distinct', // No permitir duplicados en el array
            ],
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
            'socio_ids.required' => 'La lista de socios es obligatoria.',
            'socio_ids.array' => 'Los socios deben ser enviados como una lista.',
            'socio_ids.min' => 'Debe seleccionar al menos un socio.',
            'socio_ids.max' => 'No se pueden agregar más de 100 socios a la vez.',
            
            'socio_ids.*.required' => 'Cada socio es obligatorio.',
            'socio_ids.*.integer' => 'El ID del socio debe ser un número entero.',
            'socio_ids.*.exists' => 'Uno o más socios no existen en el sistema.',
            'socio_ids.*.distinct' => 'No se pueden seleccionar socios duplicados.',
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
                $validator->errors()->add('evento', 'No se pueden agregar asistentes a un evento que ya está contabilizado.');
            }
        });
    }
}