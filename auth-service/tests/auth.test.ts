import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { InMemoryUserRepository } from '../src/repositories/inMemoryUserRepository.js';
import { sanitize } from '../src/utils/logger.js';

describe('Servicio de Autenticación (auth-service)', () => {
  let app: ReturnType<typeof createApp>['app'];
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    const appInstance = createApp({ userRepository });
    app = appInstance.app;
  });

  describe('Salud del servicio', () => {
    it('GET /health debe responder 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok', service: 'auth-service' });
    });
  });

  describe('Registro de usuario (POST /api/auth/register)', () => {
    it('debe registrar un usuario exitosamente con contraseña hasheada (sin texto plano)', async () => {
      const payload = {
        name: 'Carlos Ruiz',
        email: 'carlos@centavo.app',
        password: 'PasswordSeguro123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('carlos@centavo.app');
      expect(response.body.data.user.name).toBe('Carlos Ruiz');
      expect(response.body.data.token).toBeDefined();
      // Verificamos que la contraseña nunca se expone en la respuesta
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();

      // Verificamos en el repositorio que la contraseña fue almacenada con hash bcrypt (salt rounds 10)
      const storedUser = await userRepository.findByEmail('carlos@centavo.app');
      expect(storedUser).not.toBeNull();
      expect(storedUser?.passwordHash).not.toBe(payload.password);
      const isBcryptHash = await bcrypt.compare(payload.password, storedUser!.passwordHash);
      expect(isBcryptHash).toBe(true);
    });

    it('debe rechazar registro con correo duplicado con 409 Conflict', async () => {
      const payload = {
        name: 'Carlos Ruiz',
        email: 'carlos@centavo.app',
        password: 'PasswordSeguro123!'
      };

      await request(app).post('/api/auth/register').send(payload);

      const duplicateResponse = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('registrado');
    });

    it('debe rechazar contraseñas menores a 8 caracteres', async () => {
      const payload = {
        name: 'Carlos',
        email: 'carlos@centavo.app',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Error de validación de datos');
    });
  });

  describe('Inicio de sesión (POST /api/auth/login)', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Usuario Prueba',
        email: 'prueba@centavo.app',
        password: 'Password123'
      });
    });

    it('debe iniciar sesión con credenciales válidas y retornar JWT', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'prueba@centavo.app',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('prueba@centavo.app');
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('debe rechazar con 401 si la contraseña es incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'prueba@centavo.app',
          password: 'ContrasenaErronea'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('debe rechazar con 401 si el usuario no existe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@centavo.app',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('Verificación de sesión centralizada (GET /api/auth/verify)', () => {
    let validToken: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Sesion Test',
        email: 'sesion@centavo.app',
        password: 'Password123'
      });
      validToken = res.body.data.token;
    });

    it('debe validar exitosamente cuando se provee un token Bearer válido', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
      expect(response.body.data.user.email).toBe('sesion@centavo.app');
    });

    it('debe retornar 401 cuando no se provee token', async () => {
      const response = await request(app).get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_MISSING');
    });

    it('debe retornar 401 cuando se envía un token malformado o adulterado', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer token_manipulado_invalido');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_INVALID');
    });
  });

  describe('Perfil protegido (GET /api/auth/me)', () => {
    it('debe retornar el perfil del usuario autenticado vía authMiddleware', async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        name: 'Perfil Usuario',
        email: 'perfil@centavo.app',
        password: 'Password123'
      });
      const token = registerRes.body.data.token;

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.success).toBe(true);
      expect(meResponse.body.data.user.email).toBe('perfil@centavo.app');
      expect(meResponse.body.data.user.name).toBe('Perfil Usuario');
      expect(meResponse.body.data.user.passwordHash).toBeUndefined();
    });

    it('debe rechazar con 401 si se intenta acceder a /me sin token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Cumplimiento de AGENTS.md: Sanitización en logger', () => {
    it('debe sanitizar contraseñas, tokens y llaves sensibles en objetos', () => {
      const sensitiveData = {
        email: 'admin@centavo.app',
        password: 'SuperSecretPassword',
        token: 'eyJh.payload.signature',
        authorization: 'Bearer secret_token',
        nested: {
          refreshToken: 'refresh_secret_123',
          other: 'safe_value'
        }
      };

      const sanitized = sanitize(sensitiveData) as Record<string, unknown>;

      expect(sanitized.email).toBe('admin@centavo.app');
      expect(sanitized.password).toBe('[PROTEGIDO]');
      expect(sanitized.token).toBe('[PROTEGIDO]');
      expect(sanitized.authorization).toBe('[PROTEGIDO]');
      expect((sanitized.nested as Record<string, unknown>).refreshToken).toBe('[PROTEGIDO]');
      expect((sanitized.nested as Record<string, unknown>).other).toBe('safe_value');
    });
  });
});
