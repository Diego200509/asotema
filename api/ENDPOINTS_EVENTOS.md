# API Endpoints - Módulo Eventos

## Autenticación
Todos los endpoints requieren autenticación JWT mediante header `Authorization: Bearer <token>`

## Endpoints Disponibles

### 1. Listar Eventos
```
GET /api/eventos
```

**Parámetros de consulta:**
- `desde` (opcional): Fecha desde (YYYY-MM-DD)
- `hasta` (opcional): Fecha hasta (YYYY-MM-DD)
- `q` (opcional): Búsqueda por nombre o motivo
- `tipo` (opcional): COMPARTIDO o CUBRE_ASOTEMA
- `contabilizado` (opcional): true/false
- `per_page` (opcional): Elementos por página (default: 15)

**Permisos:** Todos los roles autenticados

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "links": {...},
    "meta": {...}
  }
}
```

### 2. Crear Evento
```
POST /api/eventos
```

**Body:**
```json
{
  "nombre": "Evento de Fin de Año",
  "motivo": "Celebración anual de ASOTEMA",
  "fecha_evento": "2025-12-31T20:00:00-05:00",
  "tipo_evento": "COMPARTIDO",
  "precio_por_asistente": 25.00,
  "costo_por_asistente": 15.00
}
```

**Permisos:** ADMIN, TESORERO

### 3. Ver Detalle de Evento
```
GET /api/eventos/{id}
```

**Permisos:** Todos los roles autenticados

**Respuesta incluye:**
- Datos del evento
- Lista de asistentes
- Resumen contable (totales, neto, etc.)

### 4. Actualizar Evento
```
PUT /api/eventos/{id}
```

**Body:** Mismos campos que crear (todos opcionales)

**Restricciones:**
- No se puede editar si está contabilizado (solo motivo)
- Solo ADMIN y TESORERO pueden editar

### 5. Eliminar Evento
```
DELETE /api/eventos/{id}
```

**Restricciones:**
- No se puede eliminar si está contabilizado
- Solo ADMIN y TESORERO pueden eliminar

### 6. Agregar Asistentes
```
POST /api/eventos/{id}/asistentes
```

**Body:**
```json
{
  "socio_ids": [1, 2, 3, 4]
}
```

**Permisos:** ADMIN, TESORERO

### 7. Toggle Asistencia
```
POST /api/eventos/{id}/toggle-asistencia
```

**Body:**
```json
{
  "socio_id": 1,
  "asistio": true
}
```

**Permisos:** ADMIN, TESORERO, CAJERO

### 8. Contabilizar Evento
```
POST /api/eventos/{id}/contabilizar
```

**Permisos:** ADMIN, TESORERO

**Descripción:** Ejecuta la lógica contable:
- Crea movimientos DEBE en cuenta "Eventos ASOTEMA (Operativo)" por precio
- Si COMPARTIDO: Crea movimientos HABER en cuenta del socio por costo
- Si CUBRE_ASOTEMA: Crea movimientos HABER en cuenta ASOTEMA por costo

### 9. Reversar Contabilización
```
POST /api/eventos/{id}/reversar
```

**Permisos:** ADMIN, TESORERO

**Descripción:** Crea movimientos inversos y marca como no contabilizado

### 10. Socios para Evento
```
GET /api/eventos/socios/para-evento
```

**Parámetros:**
- `q` (opcional): Búsqueda por nombre o cédula
- `per_page` (opcional): Elementos por página o "all"

**Permisos:** Todos los roles autenticados

## Tipos de Evento

### COMPARTIDO
- ASOTEMA recibe el precio por asistente
- Socio paga el costo (se descuenta de su cuenta)
- Neto para ASOTEMA: precio - costo

### CUBRE_ASOTEMA
- ASOTEMA recibe el precio por asistente
- ASOTEMA paga el costo (gasto institucional)
- Socio no se afecta económicamente
- Neto para ASOTEMA: precio - costo

## Cuenta Institucional
Se crea automáticamente: "Eventos ASOTEMA (Operativo)" (tipo: INSTITUCIONAL)

## Estados de Evento
- `contabilizado = false`: Evento editable, se pueden agregar asistentes
- `contabilizado = true`: Evento bloqueado, solo se puede revertir

## Validaciones
- Fechas deben ser futuras (máximo 2 años)
- Precios y costos ≥ 0 (máximo $999,999.99)
- Socios deben tener cuenta asociada
- No se pueden duplicar asistentes en el mismo evento
