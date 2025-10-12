<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Ahorros - {{ $socio->nombres }} {{ $socio->apellidos }}</title>
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
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .resumen-card {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #0ea5e9;
        }
        .resumen-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #0369a1;
            font-weight: bold;
        }
        .resumen-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #0c4a6e;
        }
        .tabla-section h2 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #16A34A;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #16A34A;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
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
        <div class="document-title">REPORTE DE AHORROS</div>
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
        <h2>Resumen de Ahorros</h2>
        <div class="resumen-grid">
            <div class="resumen-card">
                <h3>Total Ahorrado</h3>
                <div class="value">${{ number_format($resumen->saldo_actual ?? 0, 2) }}</div>
            </div>
            <div class="resumen-card">
                <h3>Aportes Realizados</h3>
                <div class="value">{{ $resumen->total_aportes ?? 0 }}</div>
            </div>
            <div class="resumen-card">
                <h3>Último Aporte</h3>
                <div class="value">{{ isset($resumen->ultimo_aporte) && $resumen->ultimo_aporte ? \Carbon\Carbon::parse($resumen->ultimo_aporte . 'T00:00:00-05:00')->format('d/m/Y') : 'N/A' }}</div>
            </div>
        </div>
    </div>

    <div class="tabla-section">
        <h2>Historial de Aportes</h2>
        @if(isset($ahorros->data) && count($ahorros->data) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>Fecha Operación</th>
                        <th>Monto</th>
                        <th>Registrado Por</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($ahorros->data as $ahorro)
                        <tr>
                            <td class="fecha">{{ \Carbon\Carbon::parse($ahorro->mes)->format('m/Y') }}</td>
                            <td class="fecha">{{ \Carbon\Carbon::parse($ahorro->fecha_operacion . 'T00:00:00-05:00')->format('d/m/Y') }}</td>
                            <td class="monto">${{ number_format($ahorro->monto, 2) }}</td>
                            <td>{{ $ahorro->registrado_por_nombre ?? ($ahorro->registrador->nombre ?? 'N/A') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                <p>No se encontraron aportes de ahorro para este socio.</p>
            </div>
        @endif
    </div>

    <div class="footer">
        <p>ASOTEMA - Asociación de Empleados y Trabajadores EP-EMA</p>
        <p>Este documento fue generado automáticamente el {{ \Carbon\Carbon::now('America/Guayaquil')->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
