<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estado de Cuenta - <?php echo e($socio->nombres); ?> <?php echo e($socio->apellidos); ?></title>
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
        
        .socio-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #16A34A;
        }
        
        .socio-info h3 {
            margin: 0 0 10px 0;
            color: #16A34A;
            font-size: 14px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
        }
        
        .info-label {
            font-weight: bold;
            color: #666;
        }
        
        .info-value {
            color: #333;
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
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        
        .summary-item {
            text-align: center;
            padding: 10px;
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
            font-size: 14px;
            font-weight: bold;
            color: #333;
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
        
        .movements-table tr:hover {
            background-color: #f0f8f0;
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
        <img src="<?php echo e(public_path('images/asotema_pdf.png')); ?>" alt="ASOTEMA" class="logo">
        <div class="company-name">ASOTEMA</div>
        <div class="company-motto">UNIDAD, TRABAJO Y SOLIDARIDAD</div>
        <div class="company-motto">ASOCIACIÓN DE EMPLEADOS Y TRABAJADORES EP-EMA</div>
    </div>

    <!-- Título del documento -->
    <div class="document-title">ESTADO DE CUENTA</div>

    <!-- Información del socio -->
    <div class="socio-info">
        <h3>INFORMACIÓN DEL SOCIO</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nombres:</span>
                <span class="info-value"><?php echo e($socio->nombres); ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Apellidos:</span>
                <span class="info-value"><?php echo e($socio->apellidos); ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Cédula:</span>
                <span class="info-value"><?php echo e($socio->cedula); ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Código:</span>
                <span class="info-value"><?php echo e($socio->codigo); ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Fecha de Ingreso:</span>
                <span class="info-value"><?php echo e(\Carbon\Carbon::parse($socio->fecha_ingreso)->format('d/m/Y')); ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Estado:</span>
                <span class="info-value"><?php echo e($socio->estado); ?></span>
            </div>
        </div>
    </div>

    <!-- Resumen de la cuenta -->
    <div class="summary">
        <h3>RESUMEN DE LA CUENTA</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Movimientos</div>
                <div class="summary-value"><?php echo e($estadoCuenta->resumen->total_movimientos ?? 0); ?></div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Debe</div>
                <div class="summary-value amount negative">$<?php echo e(number_format($estadoCuenta->resumen->total_debe ?? 0, 2, '.', ',')); ?></div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Haber</div>
                <div class="summary-value amount positive">$<?php echo e(number_format($estadoCuenta->resumen->total_haber ?? 0, 2, '.', ',')); ?></div>
            </div>
        </div>
    </div>

    <!-- Tabla de movimientos -->
    <h3 style="color: #16A34A; margin-bottom: 10px;">MOVIMIENTOS DE LA CUENTA</h3>
    <table class="movements-table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Saldo Acumulado</th>
            </tr>
        </thead>
        <tbody>
            <?php if(isset($estadoCuenta->movimientos) && count($estadoCuenta->movimientos) > 0): ?>
                <?php $__currentLoopData = $estadoCuenta->movimientos; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $movimiento): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e(\Carbon\Carbon::parse($movimiento->fecha)->format('d/m/Y')); ?></td>
                        <td><?php echo e($movimiento->tipo); ?></td>
                        <td class="amount <?php echo e($movimiento->tipo === 'HABER' ? 'positive' : 'negative'); ?>">
                            $<?php echo e(number_format($movimiento->monto, 2, '.', ',')); ?>

                        </td>
                        <td><?php echo e($movimiento->descripcion); ?></td>
                        <td class="amount">$<?php echo e(number_format($movimiento->saldo_acumulado ?? 0, 2, '.', ',')); ?></td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php else: ?>
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                        No se encontraron movimientos para este socio.
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p>Documento generado el <?php echo e(\Carbon\Carbon::now('America/Guayaquil')->format('d/m/Y H:i:s')); ?></p>
        <p>ASOTEMA - Asociación de Empleados y Trabajadores EP-EMA</p>
        <p>Este documento es confidencial y para uso interno únicamente.</p>
    </div>
</body>
</html>
<?php /**PATH D:\WorkSpace\asotema\api\resources\views/reports/estado-cuenta-socio.blade.php ENDPATH**/ ?>