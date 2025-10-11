# Módulo de Miembros (Socios) - ASOTEMA

## 📋 Descripción

El módulo de Miembros (Socios) permite gestionar los socios de ASOTEMA con un CRUD completo, validaciones robustas y generación automática de cuentas contables.

---

## 🗄️ Backend (Laravel API)

### Migraciones

#### 1. Tabla `cuentas`
- **Archivo**: `api/database/migrations/2025_10_11_000001_create_cuentas_table.php`
- **Campos**:
  - `id`: BIGINT (PK autoincremental)
  - `propietario_tipo`: ENUM('ASOTEMA', 'SOCIO') NOT NULL
  - `propietario_id`: BIGINT UNSIGNED NULL
  - `nombre`: VARCHAR(120) NOT NULL
  - `timestamps`
- **Índice único**: `(propietario_tipo, propietario_id)`

#### 2. Tabla `socios`
- **Archivo**: `api/database/migrations/2025_10_11_000002_create_socios_table.php`
- **Campos**:
  - `id`: BIGINT (PK autoincremental)
  - `codigo`: VARCHAR UNIQUE NULLABLE (autogenerado: SOC-001 hasta SOC-999)
  - `cedula`: VARCHAR UNIQUE NOT NULL
  - `nombres`: VARCHAR NOT NULL
  - `apellidos`: VARCHAR NOT NULL
  - `telefono`: VARCHAR NULLABLE
  - `correo`: VARCHAR UNIQUE NULLABLE
  - `estado`: ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO'
  - `fecha_ingreso`: DATETIME NULLABLE
  - `timestamps`
  - `softDeletes`

### Modelos

#### Cuenta (`api/app/Models/Cuenta.php`)
- **Relaciones**: Relación polimórfica con propietarios (ASOTEMA o Socio)
- **Scopes**:
  - `asotema()`: Filtra cuenta de ASOTEMA
  - `socios()`: Filtra cuentas de socios

#### Socio (`api/app/Models/Socio.php`)
- **Relaciones**: `cuenta()` - Relación con su cuenta contable
- **Accessors**: `nombre_completo` - Concatena nombres y apellidos
- **Scopes**:
  - `search($query)`: Búsqueda en nombres, apellidos, cédula, correo, código
  - `activos()`: Filtra socios activos
  - `inactivos()`: Filtra socios inactivos
- **Métodos estáticos**: `generarCodigo()` - Genera código único SOC-001 a SOC-999 (límite máximo 999 socios)

### Form Requests

#### StoreSocioRequest
- **Validaciones**:
  - `cedula`: required, string, unique, min:2
  - `nombres`: required, string, min:2
  - `apellidos`: required, string, min:2
  - `telefono`: nullable, regex (solo dígitos, espacios, guiones, paréntesis)
  - `correo`: nullable, email, unique
  - `estado`: required, in:ACTIVO,INACTIVO
  - `fecha_ingreso`: nullable, date
- **Autorización**: Solo ADMIN y TESORERO

#### UpdateSocioRequest
- **Validaciones**: Iguales a `StoreSocioRequest` pero con `ignore($socioId)` en cédula y correo
- **Autorización**: Solo ADMIN y TESORERO

### Controlador

#### SocioController (`api/app/Http/Controllers/SocioController.php`)

##### `index(Request $request)`
- **Método**: GET
- **Parámetros query**:
  - `q`: Búsqueda en múltiples campos
  - `estado`: Filtro por estado
  - `page`: Página actual
  - `per_page`: Registros por página (default: 6)
- **Respuesta**: Paginación con socios

##### `store(StoreSocioRequest $request)`
- **Método**: POST
- **Funcionalidad**:
  1. Genera código único automáticamente
  2. Crea el socio con los datos validados
  3. **Crea automáticamente su cuenta contable** con:
     - `propietario_tipo`: 'SOCIO'
     - `propietario_id`: ID del socio creado
     - `nombre`: "Cuenta {nombre_completo}"
- **Transacción**: Sí (DB::transaction)

##### `show(Socio $socio)`
- **Método**: GET
- **Respuesta**: Datos del socio con su cuenta cargada

##### `update(UpdateSocioRequest $request, Socio $socio)`
- **Método**: PUT
- **Funcionalidad**:
  1. Actualiza datos del socio
  2. Actualiza el nombre de la cuenta si existe
- **Transacción**: Sí

##### `destroy(Socio $socio)`
- **Método**: DELETE
- **Tipo**: Soft delete
- **Permisos**: Solo ADMIN y TESORERO

### Rutas API

**Archivo**: `api/routes/api.php`

```php
// Lectura para todos los roles autenticados
GET /api/socios
GET /api/socios/{socio}

// Crear, editar y eliminar solo para ADMIN y TESORERO
POST /api/socios
PUT /api/socios/{socio}
DELETE /api/socios/{socio}
```

**Middleware**:
- `auth:api`: Autenticación JWT
- `role:ADMIN,TESORERO`: Solo para escritura

### Seeders

#### CuentaSeeder
- **Archivo**: `api/database/seeders/CuentaSeeder.php`
- **Función**: Crea la cuenta de ASOTEMA si no existe
  - `propietario_tipo`: 'ASOTEMA'
  - `propietario_id`: NULL
  - `nombre`: 'Cuenta ASOTEMA'

---

## 🎨 Frontend (React + Vite + Tailwind v4)

### Componentes Reutilizables

#### 1. SocioSearch (`web/src/components/socios/SocioSearch.jsx`)
- **Props**:
  - `search`: Valor actual de búsqueda
  - `onSearchChange`: Callback para cambio de búsqueda
  - `onNewSocio`: Callback para crear nuevo socio
  - `canCreate`: Booleano para mostrar botón "Nuevo Socio"
- **Funcionalidad**: Input de búsqueda y botón de crear (condicional por permisos)

#### 2. SocioTable (`web/src/components/socios/SocioTable.jsx`)
- **Props**:
  - `socios`: Array de socios
  - `loading`: Estado de carga
  - `onEdit`: Callback para editar
  - `onDelete`: Callback para eliminar
  - `canModify`: Booleano para mostrar acciones
- **Columnas**:
  - Código
  - Cédula
  - Nombres
  - Apellidos
  - Teléfono
  - Correo
  - Estado (con Badge)
  - Acciones (iconos de editar/eliminar)
- **Estados**:
  - Loading
  - Empty state
  - Datos con hover effect
- **Scroll**: Interno con header fijo

#### 3. SocioPagination (`web/src/components/socios/SocioPagination.jsx`)
- **Props**:
  - `currentPage`: Página actual
  - `totalPages`: Total de páginas
  - `onPageChange`: Callback para cambio de página
  - `totalItems`: Total de registros
  - `perPage`: Registros por página
- **Activación**: Muestra paginación cuando hay 7+ registros

#### 4. SocioFormFields (`web/src/components/socios/SocioFormFields.jsx`)
- **Props**:
  - `formData`: Datos del formulario
  - `onChange`: Callback para cambios
  - `isEdit`: Booleano para modo edición
- **Campos**:
  - Cédula (required)
  - Código (solo visible en modo edición, disabled, autogenerado: SOC-001 a SOC-999)
  - Nombres (required)
  - Apellidos (required)
  - Teléfono (opcional)
  - Correo (opcional)
  - Fecha de Ingreso (opcional)
  - Estado (select: ACTIVO/INACTIVO)
- **Layout**: Grid responsive (1 col en móvil, 2 en desktop)
- **Modo creación**: Campo código oculto (se genera automáticamente)
- **Modo edición**: Campo código visible pero deshabilitado

#### 5. SocioModal (`web/src/components/socios/SocioModal.jsx`)
- **Props**:
  - `isOpen`: Estado del modal
  - `onClose`: Callback para cerrar
  - `socioId`: ID del socio (null para crear)
  - `onSuccess`: Callback después de crear/actualizar
- **Funcionalidad**:
  - Modo crear/editar automático
  - Carga de datos en modo edición
  - Validación de cambios (botón deshabilitado si no hay cambios)
  - Loading states
  - Toasts para feedback
  - Envío de datos a API

### Página Principal

#### Socios (`web/src/pages/Socios.jsx`)
- **Funcionalidad**:
  - Listado paginado de socios
  - Búsqueda en tiempo real
  - CRUD completo con modales
  - Modal de confirmación para eliminar
  - Control de permisos por rol:
    - **ADMIN y TESORERO**: Crear, editar, eliminar
    - **CAJERO**: Solo lectura
- **Estados**:
  - `socios`: Array de socios
  - `loading`: Carga de datos
  - `search`: Término de búsqueda
  - `currentPage`: Página actual
  - `totalPages`: Total de páginas
  - `totalItems`: Total de registros
  - `perPage`: 6 registros por página
  - `isModalOpen`: Estado del modal de formulario
  - `editingSocioId`: ID del socio en edición
  - `isDeleteModalOpen`: Estado del modal de confirmación
  - `deletingSocio`: Socio a eliminar
  - `deleteLoading`: Carga de eliminación

### Navegación

#### Sidebar
- **Nueva sección**: "Miembros" con icono de múltiples usuarios
- **Orden**:
  1. Usuarios (solo ADMIN)
  2. **Miembros** (todos los roles)
  3. Productos
  4. Ventas
  5. Reportes

#### Layout
- **Detección automática** de sección activa según ruta
- **Navegación programática** al cambiar de sección
- **Responsive** con sidebar colapsable

#### Rutas (App.jsx)
```jsx
// Todos los roles autenticados
<Route path="/socios" element={<ProtectedRoute><Socios /></ProtectedRoute>} />

// Ruta por defecto
<Route path="/" element={<Navigate to="/socios" replace />} />
```

---

## 🎨 Diseño UI

### Colores
- **Fondo**: Blanco (#FFFFFF)
- **Primario**: Verde #16A34A (botones de crear/actualizar)
- **Peligro**: Rojo #DC2626 (botón eliminar, estado INACTIVO)
- **Éxito**: Verde para estado ACTIVO
- **Grises**: Suaves para tablas y bordes

### Componentes Compartidos Utilizados
- ✅ `Button`
- ✅ `Input`
- ✅ `Select`
- ✅ `Card`
- ✅ `Badge`
- ✅ `Modal`
- ✅ `Pagination`
- ✅ `ConfirmModal`
- ✅ `Toast` (para notificaciones)

### Responsividad
- **Móvil**: Formularios en 1 columna
- **Desktop**: Formularios en 2 columnas
- **Sidebar**: Colapsable con iconos
- **Tabla**: Scroll horizontal en móvil

---

## 🔐 Permisos y Seguridad

### Backend
- **Lectura**: Todos los roles autenticados
- **Escritura**: Solo ADMIN y TESORERO
- **Validación**: Form Requests con reglas estrictas
- **Soft Deletes**: Los socios no se eliminan físicamente

### Frontend
- **Conditional Rendering**:
  - Botón "Nuevo Socio" solo si `canModify`
  - Columna "Acciones" solo si `canModify`
- **Verificación de rol**: `user.rol === 'ADMIN' || user.rol === 'TESORERO'`

---

## 📊 Flujo de Creación de Socio

1. Usuario (ADMIN/TESORERO) hace clic en "Nuevo Socio"
2. Se abre modal con formulario vacío (campo código oculto)
3. Usuario completa datos obligatorios (cédula, nombres, apellidos, estado)
4. Al enviar:
   - Frontend valida campos requeridos
   - Envía POST a `/api/socios`
   - Backend valida con `StoreSocioRequest`
   - Genera código único automáticamente (SOC-001, SOC-002, etc. hasta SOC-999)
   - Crea el socio en DB
   - **Crea automáticamente su cuenta contable**
   - Retorna socio con cuenta cargada
5. Frontend muestra toast de éxito
6. Refresca la tabla
7. Cierra el modal

---

## 📊 Relación con Cuentas

### Creación Automática
Al crear un socio, se genera automáticamente:

```php
Cuenta::create([
    'propietario_tipo' => 'SOCIO',
    'propietario_id' => $socio->id,
    'nombre' => "Cuenta {$socio->nombre_completo}",
]);
```

### Actualización
Al actualizar un socio, se actualiza el nombre de su cuenta:

```php
$socio->cuenta->update([
    'nombre' => "Cuenta {$socio->nombre_completo}",
]);
```

### Cuenta ASOTEMA
- Se crea automáticamente con el seeder
- `propietario_tipo`: 'ASOTEMA'
- `propietario_id`: NULL
- `nombre`: 'Cuenta ASOTEMA'

---

## 🚀 Comandos para Ejecutar

### Backend

```bash
cd api

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeder de cuenta ASOTEMA
php artisan db:seed --class=CuentaSeeder

# Iniciar servidor
php artisan serve
```

### Frontend

```bash
cd web

# Instalar dependencias (si es necesario)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## ✅ Checklist de Implementación

### Backend
- ✅ Migración `cuentas`
- ✅ Migración `socios`
- ✅ Modelo `Cuenta`
- ✅ Modelo `Socio`
- ✅ `StoreSocioRequest`
- ✅ `UpdateSocioRequest`
- ✅ `SocioController` con CRUD completo
- ✅ Rutas API con middleware de roles
- ✅ `CuentaSeeder` para cuenta ASOTEMA
- ✅ Generación automática de cuentas al crear socios

### Frontend
- ✅ Componente `SocioSearch`
- ✅ Componente `SocioTable`
- ✅ Componente `SocioPagination`
- ✅ Componente `SocioFormFields`
- ✅ Componente `SocioModal`
- ✅ Página `Socios`
- ✅ Ruta `/socios` en `App.jsx`
- ✅ Sección "Miembros" en `Sidebar`
- ✅ Navegación programática en `Layout`
- ✅ Control de permisos por rol
- ✅ Toasts para feedback
- ✅ Modal de confirmación para eliminar
- ✅ Paginación activada en 7+ registros

---

## 📝 Notas Adicionales

- **Código único**: 
  - Se genera automáticamente en el backend con formato SOC-001 a SOC-999
  - Límite máximo: 999 socios
  - En modo creación: Campo oculto (no se muestra)
  - En modo edición: Campo visible pero deshabilitado
- **Soft deletes**: Los socios eliminados no se borran físicamente
- **Validación de cédula y correo únicos**: Se aplica en backend con reglas de validación
- **Búsqueda**: Busca en nombres, apellidos, cédula, correo y código
- **Paginación**: 6 registros por página (configurable)
- **Estados**: ACTIVO (verde) e INACTIVO (rojo)
- **Fecha de ingreso**: Opcional, con selector de fecha
- **Teléfono**: Opcional, con validación de formato (regex)

---

## 🎉 Módulo Completado

El módulo de Miembros (Socios) está completamente funcional y listo para usar. Incluye:

- ✅ CRUD completo con validaciones robustas
- ✅ Generación automática de cuentas contables
- ✅ Permisos por rol (ADMIN, TESORERO, CAJERO)
- ✅ UI limpia y profesional con Tailwind v4
- ✅ Componentes reutilizables
- ✅ Búsqueda y paginación
- ✅ Toasts y modales de confirmación
- ✅ Responsive design
- ✅ Loading states y error handling

**¡El sistema está listo para gestionar socios de ASOTEMA! 🚀**

