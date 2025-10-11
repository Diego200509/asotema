<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSocioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo ADMIN y TESORERO pueden editar socios
        return in_array($this->user()->rol, ['ADMIN', 'TESORERO']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $socioId = $this->route('socio');

        return [
            'cedula' => [
                'required',
                'string',
                'min:2',
                Rule::unique('socios', 'cedula')->ignore($socioId),
            ],
            'nombres' => ['required', 'string', 'min:2'],
            'apellidos' => ['required', 'string', 'min:2'],
            'telefono' => ['nullable', 'string', 'regex:/^[\d\s\-\+\(\)]+$/'],
            'correo' => [
                'nullable',
                'email',
                Rule::unique('socios', 'correo')->ignore($socioId),
            ],
            'estado' => ['required', 'in:ACTIVO,INACTIVO'],
            'fecha_ingreso' => ['nullable', 'date'],
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
            'cedula.required' => 'La cédula es requerida',
            'cedula.unique' => 'Esta cédula ya está registrada',
            'cedula.min' => 'La cédula debe tener al menos 2 caracteres',
            'nombres.required' => 'Los nombres son requeridos',
            'nombres.min' => 'Los nombres deben tener al menos 2 caracteres',
            'apellidos.required' => 'Los apellidos son requeridos',
            'apellidos.min' => 'Los apellidos deben tener al menos 2 caracteres',
            'telefono.regex' => 'El teléfono tiene un formato inválido',
            'correo.email' => 'El correo debe ser una dirección válida',
            'correo.unique' => 'Este correo ya está registrado',
            'estado.required' => 'El estado es requerido',
            'estado.in' => 'El estado debe ser ACTIVO o INACTIVO',
            'fecha_ingreso.date' => 'La fecha de ingreso debe ser una fecha válida',
        ];
    }
}

