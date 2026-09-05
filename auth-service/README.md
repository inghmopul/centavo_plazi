# Auth Service 🔐

Microservicio encargado de la autenticación, autorización y gestión de usuarios para Centavo.

## Responsabilidades
- Registro e inicio de sesión de usuarios.
- Generación, firma y validación de tokens JWT.
- Encriptación y almacenamiento seguro de contraseñas con `bcrypt` (10 rounds).
- Módulo centralizado de validación de sesiones (`SessionValidator`).
- Protección y sanitización estricta de registros (nunca loguea contraseñas ni tokens en texto plano).

---

## 🛠️ Stack Tecnológico
- **Node.js**: v24+
- **TypeScript**: Compilación estricta
- **Express**: Framework web
- **Bcrypt.js**: Hashing seguro de contraseñas
- **JsonWebToken**: Generación y verificación de tokens de sesión
- **Zod**: Validación de esquemas de datos de entrada
- **Vitest & Supertest**: Suite de pruebas unitarias y de integración

---

## 🚀 Endpoints de la API

Base URL: `http://localhost:3001`

### 1. Registro de Usuario
- **Ruta:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta Exitosa (201):**
  ```json
  {
    "success": true,
    "message": "Usuario registrado exitosamente",
    "data": {
      "user": {
        "id": "usr_...",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "createdAt": "..."
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 2. Inicio de Sesión
- **Ruta:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "juan@example.com",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta Exitosa (200):** Retorna `user` y `token`.

### 3. Verificación de Sesión (Centralizada)
- **Ruta:** `GET /api/auth/verify`
- **Headers:** `Authorization: Bearer <token>`
- **Respuesta Exitosa (200):**
  ```json
  {
    "success": true,
    "valid": true,
    "data": {
      "user": {
        "id": "usr_...",
        "email": "juan@example.com",
        "name": "Juan Pérez"
      }
    }
  }
  ```

### 4. Perfil del Usuario Activo
- **Ruta:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Respuesta Exitosa (200):** Retorna el perfil seguro del usuario sin contraseña ni hash.

### 5. Health Check
- **Ruta:** `GET /health`
- **Respuesta Exitosa (200):** `{ "status": "ok", "service": "auth-service" }`

---

## 💻 Scripts Disponibles

```bash
# Instalar dependencias
npm install

# Modo desarrollo con recarga automática
npm run dev

# Ejecutar pruebas automatizadas
npm test

# Compilar a JavaScript para producción
npm run build

# Iniciar servidor en producción
npm start
```

