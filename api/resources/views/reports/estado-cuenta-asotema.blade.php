<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estado de Cuenta ASOTEMA</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            line-height: 1.4;
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
        
        .summary {
            background-color: #e7f5e7;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #16A34A;
        }
        
        .summary h3 {
            margin: 0 0 10px 0;
            color: #16A34A;
            font-size: 14px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            gap: 10px;
        }
        
        .summary-item {
            text-align: center;
            padding: 8px;
            background-color: white;
            border-radius: 3px;
            border: 1px solid #ddd;
        }
        
        .summary-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 12px;
            font-weight: bold;
            color: #333;
        }
        
        .accounts-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .accounts-table th {
            background-color: #16A34A;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }
        
        .accounts-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
        }
        
        .accounts-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .amount.positive {
            color: #16A34A;
        }
        
        .amount.negative {
            color: #dc2626;
        }
        
        .movements-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .movements-table th {
            background-color: #16A34A;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
        }
        
        .movements-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
        }
        
        .movements-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 8px;
            color: #666;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @page {
            margin: 1cm;
        }
    </style>
</head>
<body>
    <!-- Header con logo -->
    <div class="header">
        <img src="{{ public_path('images/asotema_pdf.png') }}" alt="ASOTEMA" class="logo">
        <div class="company-name">ASOTEMA</div>
        <div class="company-motto">UNIDAD, TRABAJO Y SOLIDARIDAD</div>
        <div class="company-motto">ASOCIACIÓN DE EMPLEADOS Y TRABAJADORES EP-EMA</div>
    </div>

    <!-- Título del documento -->
    <div class="document-title">ESTADO DE CUENTA ASOTEMA</div>

    <!-- Resumen General -->
    <div class="summary">
        <h3>RESUMEN GENERAL</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Cuentas</div>
                <div class="summary-value">{{ $estadoCuenta['resumen_general']['total_cuentas'] ?? 0 }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Movimientos</div>
                <div class="summary-value">{{ $estadoCuenta['resumen_general']['total_movimientos'] ?? 0 }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Debe</div>
                <div class="summary-value amount negative">${{ number_format($estadoCuenta['resumen_general']['total_debe'] ?? 0, 2, '.', ',') }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Haber</div>
                <div class="summary-value amount positive">${{ number_format($estadoCuenta['resumen_general']['total_haber'] ?? 0, 2, '.', ',') }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Saldo Total</div>
                <div class="summary-value amount {{ ($estadoCuenta['resumen_general']['saldo_total'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                    ${{ number_format($estadoCuenta['resumen_general']['saldo_total'] ?? 0, 2, '.', ',') }}
                </div>
            </div>
        </div>
    </div>

    <!-- Resumen por Cuenta -->
    <h3 style="color: #16A34A; margin-bottom: 10px;">RESUMEN POR CUENTA</h3>
    <table class="accounts-table">
        <thead>
            <tr>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th style="text-align: right;">Movimientos</th>
                <th style="text-align: right;">Total Debe</th>
                <th style="text-align: right;">Total Haber</th>
                <th style="text-align: right;">Saldo Actual</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($estadoCuenta['cuentas']) && count($estadoCuenta['cuentas']) > 0)
                @foreach($estadoCuenta['cuentas'] as $cuenta)
                    <tr>
                        <td>{{ $cuenta['nombre'] }}</td>
                        <td>{{ $cuenta['tipo'] ?? 'N/A' }}</td>
                        <td style="text-align: right;">{{ $cuenta['resumen']['total_movimientos'] ?? 0 }}</td>
                        <td class="amount">${{ number_format($cuenta['resumen']['total_debe'] ?? 0, 2, '.', ',') }}</td>
                        <td class="amount">${{ number_format($cuenta['resumen']['total_haber'] ?? 0, 2, '.', ',') }}</td>
                        <td class="amount {{ ($cuenta['saldo_actual'] ?? 0) >= 0 ? 'positive' : 'negative' }}">
                            ${{ number_format($cuenta['saldo_actual'] ?? 0, 2, '.', ',') }}
                        </td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                        No se encontraron cuentas.
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- Movimientos Consolidados -->
    <h3 style="color: #16A34A; margin-bottom: 10px; margin-top: 30px;">MOVIMIENTOS CONSOLIDADOS</h3>
    <table class="movements-table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th style="text-align: right;">Monto</th>
                <th>Descripción</th>
                <th>Creado por</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($estadoCuenta['movimientos_consolidados']) && count($estadoCuenta['movimientos_consolidados']) > 0)
                @foreach($estadoCuenta['movimientos_consolidados'] as $movimiento)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($movimiento['fecha'])->format('d/m/Y') }}</td>
                        <td>{{ $movimiento['cuenta_nombre'] ?? 'N/A' }}</td>
                        <td>{{ $movimiento['tipo'] }}</td>
                        <td class="amount {{ $movimiento['tipo'] === 'HABER' ? 'positive' : 'negative' }}">
                            ${{ number_format($movimiento['monto'], 2, '.', ',') }}
                        </td>
                        <td>{{ $movimiento['descripcion'] }}</td>
                        <td>{{ $movimiento['creado_por'] ?? 'N/A' }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                        No se encontraron movimientos.
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now('America/Guayaquil')->format('d/m/Y H:i:s') }}</p>
        <p>ASOTEMA - Asociación de Empleados y Trabajadores EP-EMA</p>
        <p>Este documento es confidencial y para uso interno únicamente.</p>
    </div>
</body>
</html>

