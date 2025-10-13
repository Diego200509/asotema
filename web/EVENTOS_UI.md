# UI de Eventos - ASOTEMA

## Estructura de Componentes

### Páginas Principales

1. **`Eventos.jsx`** - Lista de eventos
   - Filtros por fecha, texto, tipo, estado
   - Tabla con todos los eventos
   - Acciones: Ver, Editar, Contabilizar, Reversar, Eliminar
   - Paginación

2. **`EventoForm.jsx`** - Crear/Editar evento
   - Formulario con validaciones
   - Campos: nombre, motivo, fecha/hora, tipo, precio, costo
   - Cálculo automático de neto estimado
   - Información contextual según tipo de evento

3. **`EventoDetalle.jsx`** - Detalle y gestión de asistencia
   - Lista de socios (checklist)
   - Búsqueda y filtrado de socios
   - Marcar/desmarcar asistencia
   - Panel de resumen con KPIs
   - Botones para contabilizar/reversar

### Componentes Reutilizables

1. **`EventosTable.jsx`** - Tabla de eventos
   - Columnas: Nombre, Motivo, Fecha, Tipo, Precio, Costo, Asistentes, Neto, Estado, Acciones
   - Badges para tipo y estado
   - Iconos de acciones según permisos

2. **`EventosFiltros.jsx`** - Filtros de búsqueda
   - Búsqueda por texto
   - Filtro por rango de fechas
   - Filtro por tipo (COMPARTIDO/CUBRE_ASOTEMA)
   - Filtro por estado (Pendiente/Contabilizado)

3. **`EventoFormFields.jsx`** - Campos del formulario
   - Validaciones inline
   - Información contextual
   - Cálculo de neto en tiempo real

4. **`AsistentesChecklist.jsx`** - Gestión de asistentes
   - Lista ordenada alfabéticamente
   - Búsqueda por nombre o cédula
   - Checkbox para marcar asistencia
   - Botones "Seleccionar Todos" / "Deseleccionar Todos"
   - Contador de asistentes

5. **`ResumenEvento.jsx`** - Panel de resumen
   - KPIs: Asistentes confirmados, Ingresos, Costos, Neto
   - Badge de estado (Pendiente/Contabilizado)
   - Información del tipo de evento
   - Botones de acción (Contabilizar/Reversar)

6. **`ConfirmarAccionModal.jsx`** - Modal de confirmación
   - Usado para: Contabilizar, Reversar, Eliminar
   - Íconos y colores según tipo de acción
   - Mensaje personalizado

## Flujo de Trabajo

### 1. Crear Evento
1. Hacer clic en "Nuevo Evento"
2. Llenar formulario (nombre, motivo, fecha, tipo, precio, costo)
3. Guardar evento

### 2. Gestionar Asistentes
1. Entrar al detalle del evento
2. Buscar y seleccionar socios de la lista
3. Marcar/desmarcar asistencia (checkbox)
4. Ver resumen actualizado en tiempo real

### 3. Contabilizar Evento
1. Verificar asistentes confirmados
2. Revisar resumen (ingresos, costos, neto)
3. Hacer clic en "Contabilizar Evento"
4. Confirmar acción en modal
5. Se generan movimientos contables automáticamente

### 4. Reversar Contabilización
1. Hacer clic en "Reversar Contabilización"
2. Confirmar acción en modal
3. Se crean movimientos inversos
4. Evento vuelve a estado "Pendiente"

## Permisos por Rol

### ADMIN y TESORERO
- ✅ Ver eventos
- ✅ Crear eventos
- ✅ Editar eventos (solo si no están contabilizados)
- ✅ Eliminar eventos (solo si no están contabilizados)
- ✅ Marcar asistencia
- ✅ Contabilizar eventos
- ✅ Reversar contabilización

### CAJERO
- ✅ Ver eventos
- ✅ Marcar asistencia
- ❌ Crear/editar/eliminar eventos
- ❌ Contabilizar/reversar

## Validaciones

### Frontend
- Nombre: Obligatorio, máx 255 caracteres
- Motivo: Obligatorio, máx 1000 caracteres
- Fecha: Obligatoria, debe ser futura
- Tipo: Obligatorio (COMPARTIDO o CUBRE_ASOTEMA)
- Precio y Costo: Obligatorios, ≥ 0

### Backend
- Fecha no puede ser más de 2 años en el futuro
- No se puede editar evento contabilizado (solo motivo)
- No se puede eliminar evento contabilizado
- No se pueden duplicar asistentes

## Tipos de Evento

### COMPARTIDO
- **Lógica**: Socio paga el costo, ASOTEMA recibe el precio
- **Contabilidad**:
  - DEBE en cuenta "Eventos ASOTEMA (Operativo)" por precio
  - HABER en cuenta CORRIENTE del socio por costo
- **Neto ASOTEMA**: precio - costo

### CUBRE_ASOTEMA
- **Lógica**: ASOTEMA cubre todos los costos
- **Contabilidad**:
  - DEBE en cuenta "Eventos ASOTEMA (Operativo)" por precio
  - HABER en cuenta "Eventos ASOTEMA (Operativo)" por costo
- **Neto ASOTEMA**: precio - costo
- **Socio**: Solo paga precio de entrada, no se afecta su cuenta

## Estados de Evento

### Pendiente (contabilizado = false)
- ✅ Se puede editar
- ✅ Se pueden agregar/modificar asistentes
- ✅ Se puede eliminar
- ⏳ No genera movimientos contables

### Contabilizado (contabilizado = true)
- ❌ No se puede editar (solo motivo)
- ❌ No se pueden modificar asistentes
- ❌ No se puede eliminar
- ✅ Movimientos contables generados
- ✅ Se puede reversar

## Estilos y UI

### Paleta de Colores
- **Primario**: Verde #16A34A (botones principales)
- **Destructivo**: Rojo #DC2626 (eliminar)
- **Advertencia**: Naranja (reversar, CUBRE_ASOTEMA)
- **Información**: Azul (COMPARTIDO, neto positivo)
- **Éxito**: Verde (contabilizado, asistentes)
- **Secundario**: Gris (pendiente, cancelar)

### Componentes UI
- **Badges**: Tipo de evento, estado
- **Cards**: KPIs en resumen
- **Modales**: Confirmación de acciones
- **Toasts**: Notificaciones de éxito/error
- **Tablas**: Sticky header, hover effects
- **Paginación**: Consistente con el resto de la app

## Timezone
- Todas las fechas usan timezone de Ecuador: `America/Guayaquil`
- Formato de fecha/hora: `DD/MM/YYYY HH:mm`
- Input datetime-local agrega automáticamente `-05:00` al guardar
