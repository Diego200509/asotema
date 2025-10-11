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
                'regex:/^[0-9]{10}$/',
                Rule::unique('socios', 'cedula')->ignore($socioId),
                function ($attribute, $value, $fail) {
                    if (!\App\Helpers\CedulaValidator::validate($value)) {
                        $fail('La cédula no es válida según el código verificador ecuatoriano.');
                    }
                }
            ],
            'nombres' => ['required', 'string', 'min:2'],
            'apellidos' => ['required', 'string', 'min:2'],
            'telefono' => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'correo' => [
                'required',
                'email',
                Rule::unique('socios', 'correo')->ignore($socioId),
            ],
            'estado' => ['required', 'in:ACTIVO,INACTIVO'],
            'fecha_ingreso' => ['required', 'date', 'before_or_equal:today'],
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
            'cedula.regex' => 'La cédula debe tener exactamente 10 dígitos',
            'nombres.required' => 'Los nombres son requeridos',
            'nombres.min' => 'Los nombres deben tener al menos 2 caracteres',
            'apellidos.required' => 'Los apellidos son requeridos',
            'apellidos.min' => 'Los apellidos deben tener al menos 2 caracteres',
            'telefono.required' => 'El teléfono es requerido',
            'telefono.regex' => 'El teléfono debe tener exactamente 10 dígitos',
            'correo.required' => 'El correo es requerido',
            'correo.email' => 'El correo debe ser una dirección válida',
            'correo.unique' => 'Este correo ya está registrado',
            'estado.required' => 'El estado es requerido',
            'estado.in' => 'El estado debe ser ACTIVO o INACTIVO',
            'fecha_ingreso.required' => 'La fecha de ingreso es requerida',
            'fecha_ingreso.date' => 'La fecha de ingreso debe ser una fecha válida',
            'fecha_ingreso.before_or_equal' => 'La fecha de ingreso no puede ser futura',
        ];
    }
}

