# Sistema de Ahorros ASOTEMA

## Descripción General

El módulo de Ahorros permite a ASOTEMA gestionar los aportes mensuales de sus socios, manteniendo un control contable preciso con doble registro en las cuentas del socio y la cuenta institucional.

## Estructura de Base de Datos

### Tabla `cuentas` (Modificada)
```sql
-- Nuevo campo agregado
ALTER TABLE cuentas ADD COLUMN tipo ENUM('CORRIENTE','AHORRO','INSTITUCIONAL') DEFAULT 'CORRIENTE';
```

**Tipos de cuenta:**
- `CORRIENTE`: Cuentas de socios para préstamos
- `AHORRO`: Cuentas de ahorro de socios (se crean automáticamente)
- `INSTITUCIONAL`: Cuentas de ASOTEMA (Cuenta ASOTEMA, Fondo de Ahorros)

### Tabla `aportes_ahorro`
```sql
CREATE TABLE aportes_ahorro (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    socio_id BIGINT UNSIGNED NOT NULL,
    mes DATE NOT NULL, -- Normalizado a día 01 (YYYY-MM-01)
    fecha_operacion DATE NOT NULL,
    tipo ENUM('DEPOSITO','RETIRO') DEFAULT 'DEPOSITO',
    monto DECIMAL(12,2) NOT NULL,
    notas VARCHAR(255) NULL,
    registrado_por BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (socio_id) REFERENCES socios(id) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_socio_mes_tipo (socio_id, mes, tipo),
    INDEX idx_socio_mes (socio_id, mes),
    INDEX idx_mes_tipo (mes, tipo),
    INDEX idx_fecha_operacion (fecha_operacion)
);
```

## Reglas Contables

### Depósito de Ahorro
```
1. DEBE en cuenta de ahorro del socio (por monto)
2. DEBE en Fondo de Ahorros ASOTEMA (por monto)
```

### Retiro de Ahorro
```
1. HABER en cuenta de ahorro del socio (por monto)
2. HABER en Fondo de Ahorros ASOTEMA (por monto)
```

### Eliminación de Aporte (Reversión)
- **Depósito eliminado**: HABER en ambas cuentas
- **Retiro eliminado**: DEBE en ambas cuentas

## API Endpoints

### Lectura (Todos los roles autenticados)
- `GET /api/ahorros` - Listar aportes con filtros
- `GET /api/ahorros/estadisticas` - Estadísticas generales
- `GET /api/ahorros/socios` - Lista de socios para selección
- `GET /api/ahorros/socio/{id}/resumen` - Resumen completo de socio
- `GET /api/ahorros/socio/{id}/saldo` - Saldo actual de socio

### Escritura (Solo ADMIN y TESORERO)
- `POST /api/ahorros/deposito` - Registrar depósito individual
- `POST /api/ahorros/deposito-lote` - Registrar depósitos en lote
- `POST /api/ahorros/retiro` - Registrar retiro
- `DELETE /api/ahorros/{id}` - Eliminar aporte (con reversión)

## Validaciones

### Depósito Individual
```json
{
    "socio_id": "integer|required|exists:socios,id",
    "mes": "required|date_format:Y-m|before_or_equal:today",
    "fecha_operacion": "required|date|before_or_equal:today",
    "monto": "required|numeric|min:1|max:10000",
    "notas": "nullable|string|max:255"
}
```

### Depósito en Lote
```json
{
    "mes": "required|date_format:Y-m|before_or_equal:today",
    "fecha_operacion": "required|date|before_or_equal:today",
    "monto": "required|numeric|min:1|max:10000",
    "socio_ids": "required|array|min:1",
    "socio_ids.*": "integer|exists:socios,id"
}
```

### Retiro
```json
{
    "socio_id": "integer|required|exists:socios,id",
    "mes": "required|date_format:Y-m|before_or_equal:today",
    "fecha_operacion": "required|date|before_or_equal:today",
    "monto": "required|numeric|min:1|max:10000",
    "notas": "nullable|string|max:255"
}
```

## Políticas de Negocio

### 1. Un Aporte por Mes
- **Regla**: No se permite más de un depósito por socio por mes
- **Implementación**: Índice único `(socio_id, mes, tipo)`
- **Excepción**: Se pueden hacer múltiples retiros en el mismo mes

### 2. Saldo Suficiente para Retiros
- **Validación**: El socio debe tener saldo suficiente antes de retirar
- **Cálculo**: `saldo = Σ(DEPOSITO) - Σ(RETIRO)` en cuenta de ahorro

### 3. Creación Automática de Cuentas
- **Cuenta de Ahorro**: Se crea automáticamente al primer aporte
- **Nombre**: "Ahorros de {Apellidos} {Nombres}"
- **Fondo Institucional**: Se crea automáticamente si no existe

## Ejemplos de Uso

### Registrar Depósito Individual
```bash
POST /api/ahorros/deposito
{
    "socio_id": 1,
    "mes": "2025-01",
    "fecha_operacion": "2025-01-15",
    "monto": 100.00,
    "notas": "Aporte mensual enero"
}
```

### Registrar Depósitos en Lote
```bash
POST /api/ahorros/deposito-lote
{
    "mes": "2025-01",
    "fecha_operacion": "2025-01-15",
    "monto": 100.00,
    "socio_ids": [1, 2, 3, 4, 5]
}
```

### Obtener Resumen de Socio
```bash
GET /api/ahorros/socio/1/resumen

# Respuesta
{
    "success": true,
    "data": {
        "socio": {
            "id": 1,
            "nombres": "Juan",
            "apellidos": "Pérez",
            "cedula": "1234567890"
        },
        "saldo_actual": 500.00,
        "total_depositos": 600.00,
        "total_retiros": 100.00,
        "historico_por_mes": [
            {
                "mes": "2025-01-01",
                "depositos": 100.00,
                "retiros": 0.00,
                "saldo_mes": 100.00
            },
            {
                "mes": "2025-02-01",
                "depositos": 100.00,
                "retiros": 50.00,
                "saldo_mes": 50.00
            }
        ]
    }
}
```

## Integración con Sistema Existente

### Movimientos Contables
- **Tabla**: `movimientos`
- **Tipos de referencia**: `DEPOSITO_AHORRO`, `RETIRO_AHORRO`
- **Reversiones**: `REVERSION_DEPOSITO_AHORRO`, `REVERSION_RETIRO_AHORRO`

### Servicios Utilizados
- **ContabilidadService**: Para registrar movimientos DEBE/HABER
- **Middleware de Roles**: Para control de acceso
- **Soft Deletes**: Para eliminación segura con reversión

### Compatibilidad
- ✅ Compatible con sistema de préstamos existente
- ✅ Usa la misma estructura de movimientos contables
- ✅ Mantiene consistencia con roles y permisos
- ✅ Integración transparente con cuentas existentes

## Consideraciones Técnicas

### Transacciones
- Todas las operaciones de escritura usan `DB::transaction()`
- Rollback automático en caso de error
- Consistencia garantizada entre aportes y movimientos

### Performance
- Índices optimizados para consultas frecuentes
- Paginación en listados
- Consultas eficientes para resúmenes

### Seguridad
- Validación estricta de permisos por rol
- Sanitización de entradas
- Logs de auditoría (registrado_por)

---

**El módulo de Ahorros está completamente implementado y listo para usar.** 🚀
