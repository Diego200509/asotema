# Sistema de Préstamos y Movimientos Contables - ASOTEMA

## 📋 Descripción General

Sistema completo de préstamos con contabilidad de partida doble, cronograma de cuotas, pagos parciales y reportes financieros. Implementado con Laravel API JWT y middleware de roles.

## 🗄️ Estructura de Base de Datos

### Tabla `movimientos`
```sql
- id (BIGINT PK)
- cuenta_id (FK cuentas)
- tipo ENUM('DEBE','HABER')
- monto DECIMAL(12,2)
- ref_tipo VARCHAR(40) -- 'PRESTAMO'|'PAGO'
- ref_id BIGINT
- descripcion VARCHAR(255)
- creado_por (FK usuarios)
- created_at, updated_at
```

### Tabla `prestamos`
```sql
- id (BIGINT PK)
- socio_id (FK socios)
- capital DECIMAL(12,2)
- tasa_mensual DECIMAL(6,4) DEFAULT 0.0100
- plazo_meses TINYINT -- 3,6,9,12
- fecha_inicio DATE
- estado ENUM('PENDIENTE','CANCELADO','MORA') DEFAULT 'PENDIENTE'
- creado_por (FK usuarios)
- created_at, updated_at
```

### Tabla `cuotas_prestamo`
```sql
- id (BIGINT PK)
- prestamo_id (FK prestamos)
- numero_cuota SMALLINT
- fecha_vencimiento DATE
- monto_esperado DECIMAL(12,2)
- parte_interes DECIMAL(12,2)
- parte_capital DECIMAL(12,2)
- monto_pagado DECIMAL(12,2) DEFAULT 0
- pagada_en DATETIME NULL
- estado ENUM('PENDIENTE','PAGADA','PARCIAL') DEFAULT 'PENDIENTE'
- created_at, updated_at
- UNIQUE(prestamo_id, numero_cuota)
```

## 🔧 Servicios Implementados

### ContabilidadService

#### Métodos Principales:
- `debe($cuentaId, $monto, $refTipo, $refId, $desc, $userId)` - Registrar movimiento DEBE
- `haber($cuentaId, $monto, $refTipo, $refId, $desc, $userId)` - Registrar movimiento HABER
- `saldoCuenta($cuentaId)` - Calcular saldo: Σ(DEBE) - Σ(HABER)
- `registrarPrestamo($socioId, $capital, $prestamoId, $userId)` - Asiento contable para préstamo
- `registrarPago($socioId, $montoTotal, $interes, $capital, $prestamoId, $userId)` - Asiento contable para pago

### PrestamoService

#### Métodos Principales:
- `crearPrestamo($socioId, $capital, $plazo, $fechaInicio, $tasa=0.01)` - Crear préstamo + cronograma
- `pagarCuota($prestamoId, $numeroCuota, $monto, $cobradorUserId)` - Registrar pago de cuota
- `obtenerPrestamos($filtros)` - Listar préstamos con filtros
- `obtenerDetallePrestamo($prestamoId)` - Detalle + cronograma

## 📊 Convenciones Contables

### Fórmula de Saldo
```
Saldo(cuenta) = Σ(Movimientos DEBE) - Σ(Movimientos HABER)
```

### Asientos Automáticos

#### Al Crear Préstamo:
1. **DEBE** en cuenta del SOCIO por el capital (genera deuda)
2. **HABER** en cuenta "Cartera de préstamos" por el capital (capital disponible)

#### Al Registrar Pago:
1. **HABER** en cuenta del SOCIO por el monto total (reduce deuda)
2. **DEBE** en cuenta ASOTEMA por la parte de interés (ingreso)
3. **DEBE** en cuenta "Cartera de préstamos" por la parte de capital (recupera capital)

## 🧮 Cálculo de Cuotas

### Fórmula de Cuota Fija:
```
Cuota = (P / n) + (P × i)

Donde:
P = Capital total
n = Número de cuotas
i = Tasa mensual (1% = 0.01)
```

**Ejemplo**: Préstamo de $500 por 6 meses al 1% mensual
- Capital por cuota: $500 ÷ 6 = $83.33
- Interés fijo: $500 × 0.01 = $5.00
- Cuota fija: $83.33 + $5.00 = $88.33

### Distribución por Cuota:
1. **Interés** = Capital total × tasa mensual (fijo en todas las cuotas)
2. **Capital** = Capital total ÷ número de cuotas
3. **Cuota fija** = Capital + Interés
4. **Saldo pendiente** = Saldo anterior - Capital de la cuota

## 🔐 Permisos por Rol

### ADMIN y TESORERO:
- ✅ Crear préstamos
- ✅ Registrar pagos
- ✅ Ver todos los reportes
- ✅ Acceso completo al sistema

### CAJERO:
- ❌ Crear préstamos
- ✅ Registrar pagos
- ✅ Ver estado de cuenta de socios
- ❌ Reportes administrativos

## 🌐 Endpoints de la API

### Préstamos
```http
POST   /api/prestamos              # Crear préstamo (ADMIN,TESORERO)
GET    /api/prestamos              # Listar préstamos (todos)
GET    /api/prestamos/{id}         # Detalle préstamo (todos)
POST   /api/prestamos/{id}/pagar   # Registrar pago (todos)
```

### Reportes
```http
GET /api/reportes/socio/{id}/estado      # Estado cuenta socio (todos)
GET /api/reportes/cartera-prestamos      # Cartera préstamos (ADMIN,TESORERO)
GET /api/reportes/ingresos-intereses     # Ingresos intereses (ADMIN,TESORERO)
```

## 📝 Validaciones

### Crear Préstamo:
- Socio debe existir y estar ACTIVO
- Capital: $100 - $50,000
- Plazo: 3, 6, 9 o 12 meses
- Fecha inicio: hoy o posterior
- Tasa: 0.1% - 10% (default: 1%)

### Registrar Pago:
- Cuota debe existir para el préstamo
- Monto: $0.01 - $10,000

## 💰 Ejemplo de Flujo Completo

### 1. Crear Préstamo
```json
POST /api/prestamos
{
  "socio_id": 1,
  "capital": 1000.00,
  "plazo_meses": 6,
  "fecha_inicio": "2025-01-11"
}
```

**Resultado:**
- ✅ Préstamo creado con ID
- ✅ 6 cuotas generadas automáticamente
- ✅ DEBE en cuenta del socio por $1,000
- ✅ HABER en Cartera por $1,000

### 2. Registrar Pago
```json
POST /api/prestamos/1/pagar
{
  "numero_cuota": 1,
  "monto": 175.00
}
```

**Resultado:**
- ✅ Cuota actualizada
- ✅ HABER en cuenta del socio por $175
- ✅ DEBE en ASOTEMA por interés
- ✅ DEBE en Cartera por capital recuperado

### 3. Consultar Estado
```http
GET /api/reportes/socio/1/estado
```

**Resultado:**
- ✅ Movimientos de la cuenta del socio
- ✅ Saldo actual
- ✅ Resumen contable

## 🚀 Características Avanzadas

### Pagos Parciales y Anticipados
- ✅ Permite pagos parciales de cuotas
- ✅ Si sobra dinero, se aplica a cuotas siguientes
- ✅ Distribución automática: primero interés, luego capital

### Transacciones de Base de Datos
- ✅ Todas las operaciones en `DB::transaction()`
- ✅ Rollback automático en caso de error
- ✅ Integridad de datos garantizada

### Reportes en Tiempo Real
- ✅ Saldos actualizados automáticamente
- ✅ Historial completo de movimientos
- ✅ Seguimiento de ingresos por intereses

## 🔍 Consultas SQL Útiles

### Saldo de Cuenta:
```sql
SELECT SUM(CASE WHEN tipo='DEBE' THEN monto ELSE 0 END) - 
       SUM(CASE WHEN tipo='HABER' THEN monto ELSE 0 END) as saldo
FROM movimientos WHERE cuenta_id = ?;
```

### Capital Pendiente en Cartera:
```sql
SELECT SUM(CASE WHEN tipo='HABER' THEN monto ELSE 0 END) - 
       SUM(CASE WHEN tipo='DEBE' THEN monto ELSE 0 END) as capital_pendiente
FROM movimientos 
WHERE cuenta_id = ? AND ref_tipo IN ('PRESTAMO','PAGO');
```

## ✅ Criterios de Aceptación

### ✅ Crear Préstamo:
- [x] Registro en tabla `prestamos`
- [x] Generación automática de `cuotas_prestamo`
- [x] Movimiento DEBE en cuenta del socio
- [x] Movimiento HABER en Cartera de préstamos

### ✅ Registrar Pago:
- [x] Actualización de cuotas afectadas
- [x] Movimientos contables correctos
- [x] Distribución interés/capital
- [x] Cambio de estado a 'CANCELADO' si se paga todo

### ✅ Reportes:
- [x] Estado de cuenta con movimientos del socio
- [x] Saldo consistente con movimientos
- [x] Reportes administrativos para ADMIN/TESORERO

## 🎯 Próximas Mejoras

- [ ] Notificaciones de cuotas vencidas
- [ ] Reportes de mora automáticos
- [ ] Integración con sistema de cobros
- [ ] Dashboard financiero
- [ ] Exportación de reportes a PDF/Excel
