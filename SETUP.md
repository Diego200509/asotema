# ASOTEMA - Sistema de Gestión de Usuarios

## Configuración del Proyecto

Este proyecto está dividido en dos partes:
- **API (Laravel + JWT)**: Backend ubicado en la carpeta `api/`
- **Web (React + Vite + Tailwind v4)**: Frontend ubicado en la carpeta `web/`

---

## 🚀 Instalación y Configuración

### **1. Backend (Laravel API)**

#### Requisitos previos:
- PHP 8.2 o superior
- Composer
- Base de datos (MySQL/SQLite)

#### Pasos:

1. **Navegar a la carpeta del API:**
   ```bash
   cd api
   ```

2. **Instalar dependencias:**
   ```bash
   composer install
   ```

3. **Configurar el archivo `.env`:**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` y configurar la base de datos:
   ```env
   DB_CONNECTION=sqlite
   # O si usas MySQL:
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=asotema
   # DB_USERNAME=root
   # DB_PASSWORD=
   ```

4. **Generar la clave de la aplicación:**
   ```bash
   php artisan key:generate
   ```

5. **Generar la clave secreta de JWT:**
   ```bash
   php artisan jwt:secret
   ```

6. **Ejecutar las migraciones:**
   ```bash
   php artisan migrate
   ```

7. **Ejecutar los seeders (crear usuario ADMIN inicial):**
   ```bash
   php artisan db:seed
   ```

8. **Iniciar el servidor de desarrollo:**
   ```bash
   php artisan serve
   ```
   
   El API estará disponible en: `http://localhost:8000`

---

### **2. Frontend (React + Vite)**

#### Requisitos previos:
- Node.js 18 o superior
- npm o yarn

#### Pasos:

1. **Navegar a la carpeta web:**
   ```bash
   cd web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el proxy en `vite.config.js`:**
   
   El archivo ya está configurado para hacer proxy al API en `http://localhost:8000`. Si tu API está en otro puerto, ajusta la configuración:
   
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8000',
         changeOrigin: true,
       },
     },
   }
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   
   El frontend estará disponible en: `http://localhost:5173`

---

## 👤 Credenciales de Acceso

Después de ejecutar los seeders, puedes iniciar sesión con:

- **Correo:** `admin@asotema.com`
- **Contraseña:** `123456`
- **Rol:** ADMIN

Usuarios adicionales creados:
- **Carlos Cajero:** `carlos.cajero@asotema.com` / `123456` (CAJERO)
- **María Tesorera:** `maria.tesorera@asotema.com` / `123456` (TESORERO)

---

## 📋 Endpoints del API

### **Autenticación:**

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión (requiere JWT)
- `GET /api/me` - Obtener datos del usuario autenticado (requiere JWT)

### **Usuarios (Solo ADMIN):**

- `GET /api/usuarios` - Listar usuarios con paginación y búsqueda
- `POST /api/usuarios` - Crear nuevo usuario
- `GET /api/usuarios/{id}` - Obtener un usuario específico
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario (soft delete)

---

## 🎨 Características del Frontend

### **Diseño:**
- Fondo blanco con diseño limpio y profesional
- Color primario: Verde (`#16A34A`) - aplicado con CSS personalizado
- Color de acento crítico: Rojo (`#DC2626`) - aplicado con CSS personalizado
- Tipografía moderna con `system-ui` y componentes con sombra suave
- Diseño completamente responsivo
- Clases CSS personalizadas para componentes reutilizables

### **Funcionalidades:**

1. **Login:**
   - Validación de credenciales
   - Almacenamiento de JWT en localStorage
   - Redirección automática al panel
   - Componentes modulares: LoginHeader, LoginForm, LoginCredentials

2. **Panel de Usuarios:**
   - Tabla con listado de usuarios
   - Búsqueda en tiempo real por nombre o correo
   - Paginación
   - Botones de editar y eliminar
   - Badges de rol y estado (activo/inactivo)
   - Componentes modulares: UsuarioTable, UsuarioSearch, UsuarioPagination

3. **Formulario de Usuario:**
   - Crear y editar usuarios
   - Select de rol (ADMIN, CAJERO, TESORERO)
   - Toggle para activar/desactivar usuario
   - Validación de campos
   - Componentes modulares: UsuarioFormFields, UsuarioFormActions

4. **Protección de Rutas:**
   - Solo usuarios autenticados pueden acceder
   - Solo usuarios con rol ADMIN pueden gestionar usuarios
   - Redirección automática si no está autorizado

### **Arquitectura de Componentes:**

```
src/
├── components/
│   ├── shared/           # Componentes reutilizables
│   │   ├── Button.jsx    # Botones con variantes (primary, danger, secondary)
│   │   ├── Input.jsx     # Campos de entrada con validación
│   │   ├── Select.jsx    # Select con opciones
│   │   ├── Switch.jsx    # Toggle switch
│   │   ├── Card.jsx      # Tarjetas con sombra
│   │   ├── Badge.jsx     # Badges de estado y rol
│   │   ├── Modal.jsx     # Modales reutilizables
│   │   ├── Alert.jsx     # Alertas de error/success
│   │   ├── Header.jsx    # Header con usuario y logout
│   │   └── index.js      # Exportaciones centralizadas
│   ├── login/            # Componentes específicos de login
│   │   ├── LoginHeader.jsx
│   │   ├── LoginForm.jsx
│   │   ├── LoginCredentials.jsx
│   │   ├── LoginCard.jsx
│   │   └── index.js
│   ├── usuarios/         # Componentes específicos de usuarios
│   │   ├── UsuarioTable.jsx
│   │   ├── UsuarioSearch.jsx
│   │   ├── UsuarioPagination.jsx
│   │   ├── UsuarioFormFields.jsx
│   │   ├── UsuarioFormActions.jsx
│   │   └── index.js
│   └── ProtectedRoute.jsx
└── pages/                # Páginas principales (orquestadores)
    ├── Login.jsx
    ├── Usuarios.jsx
    └── UsuarioForm.jsx
```

---

## 🔒 Seguridad

### **Backend:**
- Autenticación JWT
- Middleware de roles
- Validación de datos en cada request
- Soft deletes en usuarios

### **Frontend:**
- Interceptores de Axios para manejar tokens
- Redirección automática en caso de token inválido
- Protección de rutas por rol

---

## 🗄️ Base de Datos

### **Tabla `usuarios`:**

| Campo       | Tipo      | Descripción                          |
|-------------|-----------|--------------------------------------|
| id          | BIGINT    | ID autoincremental                   |
| nombre      | VARCHAR   | Nombre del usuario                   |
| correo      | VARCHAR   | Correo electrónico (único)           |
| password    | VARCHAR   | Contraseña (texto plano temporal)    |
| rol         | ENUM      | ADMIN, CAJERO, TESORERO              |
| activo      | BOOLEAN   | Estado del usuario (default: true)   |
| created_at  | TIMESTAMP | Fecha de creación                    |
| updated_at  | TIMESTAMP | Fecha de actualización               |
| deleted_at  | TIMESTAMP | Fecha de eliminación (soft delete)   |

---

## 🛠️ Tecnologías Utilizadas

### **Backend:**
- Laravel 11
- JWT Auth (tymon/jwt-auth)
- SQLite/MySQL

### **Frontend:**
- React 19
- Vite 7
- TailwindCSS v4 (con configuración personalizada)
- React Router DOM 7
- Axios 1.12
- CSS personalizado con colores específicos (#16A34A, #DC2626)

---

## 📝 Notas Importantes

1. **Contraseñas en texto plano:** Por seguridad, este proyecto almacena contraseñas en texto plano SOLO para desarrollo. En producción, debes implementar hashing con bcrypt.

2. **CORS:** Si tienes problemas de CORS, asegúrate de configurar correctamente el middleware de CORS en Laravel.

3. **JWT Secret:** Asegúrate de generar una clave JWT única ejecutando `php artisan jwt:secret`.

---

## 🐛 Solución de Problemas

### **Error: CORS**
Verificar que el backend permite las solicitudes desde el frontend. En Laravel, el middleware de CORS está configurado por defecto.

### **Error: Token inválido**
- Verificar que el token se esté enviando correctamente en el header `Authorization: Bearer {token}`
- Verificar que la clave JWT esté configurada correctamente en `.env`

### **Error: Base de datos**
- Verificar que las migraciones se hayan ejecutado correctamente
- Verificar la conexión a la base de datos en el archivo `.env`

---

## 📧 Contacto

Para soporte o consultas sobre el proyecto ASOTEMA, contacta al equipo de desarrollo.

---

## 📄 Licencia

Este proyecto es propiedad de ASOTEMA y está destinado únicamente para uso interno.

