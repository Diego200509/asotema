<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Descuentos Mensuales - {{ $descuentos['mes'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 15px;
        }
        
        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 15px;
            display: block;
        }
        
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 5px;
        }
        
        .period {
            font-size: 16px;
            font-weight: bold;
            color: #2c5aa0;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .table th {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
        }
        
        .table td {
            border: 1px solid #dee2e6;
            padding: 5px;
            text-align: center;
            font-size: 10px;
        }
        
        .table th.small {
            font-size: 9px;
            padding: 4px;
        }
        
        .table td.small {
            font-size: 9px;
            padding: 3px;
        }
        
        .table td.left {
            text-align: left;
            padding-left: 8px;
        }
        
        .table td.number {
            text-align: right;
            padding-right: 8px;
        }
        
        .total-row {
            background-color: #e9ecef;
            font-weight: bold;
        }
        
        .total-row td {
            border-top: 2px solid #2c5aa0;
            font-size: 11px;
        }
        
        .total-text {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            font-weight: bold;
            color: #2c5aa0;
        }
        
        .signature-section {
            margin-top: 40px;
            text-align: center;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            width: 300px;
            margin: 0 auto 5px auto;
        }
        
        .signature-text {
            font-size: 11px;
            color: #666;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/asotema_pdf.png') }}" alt="ASOTEMA" class="logo">
        <div class="title">ASOCIACIÓN DE TRABAJADORES Y EMPLEADOS DEL MERCADO MAYORISTA AMBATO</div>
        <div class="period">DESCUENTO MES DE {{ strtoupper($descuentos['mes']) }}</div>
    </div>

    <table class="table">
        <thead>
            <!-- Primera fila de encabezados principales -->
            <tr>
                <th rowspan="2" style="width: 4%;">N°</th>
                <th rowspan="2" style="width: 25%;">APELLIDOS Y NOMBRES</th>
                <th rowspan="2" style="width: 10%;">CÉDULA DE IDENTIDAD</th>
                <th rowspan="2" style="width: 8%;">AHORRO</th>
                <th rowspan="2" style="width: 8%;">GASTOS</th>
                @if(count($descuentos['prestamos_unicos']) > 0)
                    <th colspan="{{ count($descuentos['prestamos_unicos']) }}" style="width: {{ count($descuentos['prestamos_unicos']) * 6 }}%;">CUOTAS PRÉSTAMOS</th>
                @endif
                <th rowspan="2" style="width: 8%;">TOTAL</th>
            </tr>
            <!-- Segunda fila de encabezados de préstamos -->
            @if(count($descuentos['prestamos_unicos']) > 0)
            <tr>
                @foreach($descuentos['prestamos_unicos'] as $index => $prestamo)
                <th class="small" style="width: 6%;">PRÉSTAMO {{ $index + 1 }}</th>
                @endforeach
            </tr>
            @endif
        </thead>
        <tbody>
            @foreach($descuentos['descuentos'] as $index => $descuento)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td class="left">{{ strtoupper($descuento['socio']->apellidos . ' ' . $descuento['socio']->nombres) }}</td>
                <td>{{ $descuento['socio']->cedula }}</td>
                <td class="number">{{ number_format($descuento['ahorro'], 2, ',', '.') }}</td>
                <td class="number">{{ number_format($descuento['gastos_eventos'], 2, ',', '.') }}</td>
                @foreach($descuentos['prestamos_unicos'] as $prestamo)
                <td class="number small">{{ number_format($descuento['cuotas_por_prestamo']['prestamo_' . $prestamo->id] ?? 0, 2, ',', '.') }}</td>
                @endforeach
                <td class="number">{{ number_format($descuento['total'], 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3"><strong>TOTAL A DESCONTAR</strong></td>
                <td class="number"><strong>{{ number_format($descuentos['totales']['ahorro'], 2, ',', '.') }}</strong></td>
                <td class="number"><strong>{{ number_format($descuentos['totales']['gastos_eventos'], 2, ',', '.') }}</strong></td>
                @foreach($descuentos['prestamos_unicos'] as $prestamo)
                <td class="number small"><strong>{{ number_format($descuentos['totales']['prestamo_' . $prestamo->id] ?? 0, 2, ',', '.') }}</strong></td>
                @endforeach
                <td class="number"><strong>{{ number_format($descuentos['totales']['total'], 2, ',', '.') }}</strong></td>
            </tr>
        </tfoot>
    </table>

    <div class="total-text">
        SON: {{ ucwords(\App\Services\NumberToWordsService::convertir($descuentos['totales']['total'])) }} DÓLARES {{ number_format(($descuentos['totales']['total'] - floor($descuentos['totales']['total'])) * 100, 0) }}/100
    </div>

    <div class="signature-section">
        <div class="signature-line"></div>
        <div class="signature-text">TLGA. ANABEL ALTAMIRANO</div>
        <div class="signature-text">TESORERA ASOTEMA</div>
    </div>
</body>
</html>
