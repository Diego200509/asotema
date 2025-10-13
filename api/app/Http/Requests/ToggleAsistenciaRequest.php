<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ToggleAsistenciaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // ADMIN, TESORERO y CAJERO pueden marcar asistencia
        return in_array($this->user()->rol, ['ADMIN', 'TESORERO', 'CAJERO']);
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
            ],
            'asistio' => [
                'sometimes',
                'boolean',
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
            'socio_id.required' => 'El ID del socio es obligatorio.',
            'socio_id.integer' => 'El ID del socio debe ser un número entero.',
            'socio_id.exists' => 'El socio no existe en el sistema.',
            
            'asistio.boolean' => 'El estado de asistencia debe ser verdadero o falso.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $evento = $this->route('evento');
            $socioId = $this->input('socio_id');
            
            if ($evento && $socioId) {
                // Verificar que el socio esté registrado en el evento
                $asistente = \App\Models\AsistenteEvento::where('evento_id', $evento->id)
                    ->where('socio_id', $socioId)
                    ->first();
                    
                if (!$asistente) {
                    $validator->errors()->add('socio_id', 'El socio no está registrado en este evento.');
                }
            }
        });
    }
}