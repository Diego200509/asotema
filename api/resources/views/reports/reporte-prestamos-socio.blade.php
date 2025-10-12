<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Préstamos - {{ $socio->nombres }} {{ $socio->apellidos }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #16A34A;
            padding-bottom: 20px;
        }
        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 15px;
            display: block;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #16A34A;
            margin-bottom: 5px;
        }
        .company-motto {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        .document-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 20px 0 10px;
        }
        .socio-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .socio-info h2 {
            margin: 0 0 15px 0;
            font-size: 20px;
            color: #16A34A;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
        }
        .info-value {
            color: #111827;
        }
        .resumen-section {
            margin-bottom: 30px;
        }
        .resumen-section h2 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #16A34A;
            text-align: center;
        }
        .resumen-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .resumen-card {
            background-color: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #0ea5e9;
        }
        .resumen-card.green {
            background-color: #f0fdf4;
            border-color: #16a34a;
        }
        .resumen-card.green h3 {
            color: #15803d;
        }
        .resumen-card.green .value {
            color: #166534;
        }
        .resumen-card.blue {
            background-color: #eff6ff;
            border-color: #3b82f6;
        }
        .resumen-card.blue h3 {
            color: #1d4ed8;
        }
        .resumen-card.blue .value {
            color: #1e40af;
        }
        .resumen-card.purple {
            background-color: #faf5ff;
            border-color: #a855f7;
        }
        .resumen-card.purple h3 {
            color: #7c3aed;
        }
        .resumen-card.purple .value {
            color: #6b21a8;
        }
        .resumen-card.orange {
            background-color: #fff7ed;
            border-color: #ea580c;
        }
        .resumen-card.orange h3 {
            color: #c2410c;
        }
        .resumen-card.orange .value {
            color: #9a3412;
        }
        .resumen-card h3 {
            margin: 0 0 8px 0;
            font-size: 12px;
            font-weight: bold;
        }
        .resumen-card .value {
            font-size: 18px;
            font-weight: bold;
        }
        .tabla-section h2 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #16A34A;
            text-align: center;
        }
        .prestamo-detalle {
            margin-bottom: 40px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .prestamo-header {
            background-color: #16A34A;
            color: white;
            padding: 15px;
            font-weight: bold;
            font-size: 16px;
        }
        .prestamo-info {
            padding: 20px;
            background-color: #f8f9fa;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-item-detalle {
            text-align: center;
        }
        .info-item-detalle .label {
            font-size: 12px;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .info-item-detalle .value {
            font-size: 14px;
            color: #111827;
            font-weight: bold;
        }
        .cuotas-table {
            width: 100%;
            font-size: 10px;
        }
        .cuotas-table th {
            background-color: #f3f4f6;
            color: #374151;
            padding: 8px 4px;
            font-size: 9px;
        }
        .cuotas-table td {
            padding: 6px 4px;
            border-bottom: 1px solid #e5e7eb;
        }
        .estado-badge {
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .estado-badge.pagada {
            background-color: #dcfce7;
            color: #166534;
        }
        .estado-badge.parcial {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .estado-badge.pendiente {
            background-color: #fef3c7;
            color: #92400e;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 11px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #16A34A;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        tr:hover {
            background-color: #f3f4f6;
        }
        .monto {
            text-align: right;
            font-weight: bold;
        }
        .fecha {
            text-align: center;
        }
        .estado {
            text-align: center;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .estado.activo {
            background-color: #dcfce7;
            color: #166534;
        }
        .estado.pendiente {
            background-color: #fef3c7;
            color: #92400e;
        }
        .estado.finalizado {
            background-color: #e5e7eb;
            color: #374151;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #6b7280;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/asotema_pdf.png') }}" alt="ASOTEMA" class="logo">
        <div class="company-name">ASOTEMA</div>
        <div class="company-motto">UNIDAD, TRABAJO Y SOLIDARIDAD</div>
        <div class="company-motto">ASOCIACIÓN DE EMPLEADOS Y TRABAJADORES EP-EMA</div>
        <div class="document-title">REPORTE DE PRÉSTAMOS</div>
    </div>

    <div class="socio-info">
        <h2>Información del Socio</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nombre Completo:</span>
                <span class="info-value">{{ $socio->nombres }} {{ $socio->apellidos }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Cédula:</span>
                <span class="info-value">{{ $socio->cedula }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Código:</span>
                <span class="info-value">{{ $socio->codigo }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Estado:</span>
                <span class="info-value">{{ $socio->estado }}</span>
            </div>
        </div>
    </div>

    <div class="resumen-section">
        <h2>Resumen de Préstamos</h2>
        <div class="resumen-grid">
            <div class="resumen-card green">
                <h3>Total Prestado</h3>
                <div class="value">${{ number_format(collect($prestamos->data ?? [])->sum('capital'), 2) }}</div>
            </div>
            <div class="resumen-card blue">
                <h3>Préstamos Activos</h3>
                <div class="value">{{ collect($prestamos->data ?? [])->filter(function($p) { return $p->estado === 'ACTIVO' || $p->estado === 'PENDIENTE'; })->count() }}</div>
            </div>
            <div class="resumen-card purple">
                <h3>Total Pagado</h3>
                <div class="value">${{ number_format(collect($prestamos->data ?? [])->sum(function($p) { 
                    return collect($p->cuotas ?? [])->sum('monto_pagado'); 
                }), 2) }}</div>
            </div>
            <div class="resumen-card orange">
                <h3>Pendiente</h3>
                <div class="value">${{ number_format(collect($prestamos->data ?? [])->sum(function($p) { 
                    return collect($p->cuotas ?? [])->sum(function($cuota) {
                        return $cuota->monto_esperado - $cuota->monto_pagado;
                    }); 
                }), 2) }}</div>
            </div>
        </div>
    </div>

    <div class="tabla-section">
        <h2>Detalle de Préstamos y Cronograma de Cuotas</h2>
        @if(isset($prestamos->data) && count($prestamos->data) > 0)
            @foreach($prestamos->data as $prestamo)
                <div class="prestamo-detalle">
                    <!-- Header del préstamo -->
                    <div class="prestamo-header">
                        Préstamo #{{ $prestamo->id }} - ${{ number_format($prestamo->capital, 2) }}
                    </div>
                    
                    <!-- Información del préstamo -->
                    <div class="prestamo-info">
                        <div class="info-item-detalle">
                            <div class="label">Capital</div>
                            <div class="value">${{ number_format($prestamo->capital, 2) }}</div>
                        </div>
                        <div class="info-item-detalle">
                            <div class="label">Tasa Interés</div>
                            <div class="value">{{ number_format($prestamo->tasa_mensual * 100, 2) }}%</div>
                        </div>
                        <div class="info-item-detalle">
                            <div class="label">Plazo</div>
                            <div class="value">{{ $prestamo->plazo_meses }} meses</div>
                        </div>
                        <div class="info-item-detalle">
                            <div class="label">Estado</div>
                            <div class="value">
                                <span class="estado {{ strtolower($prestamo->estado) }}">
                                    {{ $prestamo->estado }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Resumen de cuotas -->
                    <div class="prestamo-info" style="background-color: #f0f9ff;">
                        <div class="info-item-detalle">
                            <div class="label">Total Cuotas</div>
                            <div class="value">{{ count($prestamo->cuotas ?? []) }}</div>
                        </div>
                        <div class="info-item-detalle">
                            <div class="label">Cuotas Pagadas</div>
                            <div class="value" style="color: #16a34a;">
                                {{ collect($prestamo->cuotas ?? [])->filter(function($cuota) { return $cuota->estado === 'PAGADA'; })->count() }}
                            </div>
                        </div>
                        <div class="info-item-detalle">
                            <div class="label">Cuotas Pendientes</div>
                            <div class="value" style="color: #dc2626;">
                                {{ collect($prestamo->cuotas ?? [])->filter(function($cuota) { return $cuota->estado === 'PENDIENTE' || $cuota->estado === 'PARCIAL'; })->count() }}
                            </div>
                        </div>
                        <div class="info-item-detalle">
                            <div class="label">Total Pagado</div>
                            <div class="value" style="color: #16a34a;">
                                ${{ number_format(collect($prestamo->cuotas ?? [])->sum('monto_pagado'), 2) }}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cronograma de cuotas -->
                    @if(isset($prestamo->cuotas) && count($prestamo->cuotas) > 0)
                        <table class="cuotas-table">
                            <thead>
                                <tr>
                                    <th>Cuota</th>
                                    <th>Vencimiento</th>
                                    <th>Monto Esperado</th>
                                    <th>Interés</th>
                                    <th>Capital</th>
                                    <th>Pagado</th>
                                    <th>Pendiente</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($prestamo->cuotas as $cuota)
                                    <tr>
                                        <td class="fecha">{{ $cuota->numero_cuota }}</td>
                                        <td class="fecha">{{ \Carbon\Carbon::parse($cuota->fecha_vencimiento)->format('d/m/Y') }}</td>
                                        <td class="monto">${{ number_format($cuota->monto_esperado, 2) }}</td>
                                        <td class="monto">${{ number_format($cuota->parte_interes, 2) }}</td>
                                        <td class="monto">${{ number_format($cuota->parte_capital, 2) }}</td>
                                        <td class="monto" style="color: #16a34a;">${{ number_format($cuota->monto_pagado, 2) }}</td>
                                        <td class="monto" style="color: #dc2626;">${{ number_format($cuota->monto_esperado - $cuota->monto_pagado, 2) }}</td>
                                        <td>
                                            <span class="estado-badge {{ strtolower($cuota->estado) }}">
                                                {{ $cuota->estado }}
                                            </span>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                </div>
            @endforeach
        @else
            <div class="no-data">
                <p>No se encontraron préstamos para este socio.</p>
            </div>
        @endif
    </div>

    <div class="footer">
        <p>ASOTEMA - Asociación de Empleados y Trabajadores EP-EMA</p>
        <p>Este documento fue generado automáticamente el {{ \Carbon\Carbon::now('America/Guayaquil')->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
