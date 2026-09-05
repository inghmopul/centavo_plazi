import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { SessionValidator } from '../src/modules/session/sessionValidator.js';
import { config } from '../src/config/env.js';

describe('Módulo Central SessionValidator', () => {
  it('debe rechazar cuando el token no es proporcionado o es nulo', () => {
    const resultNull = SessionValidator.validateToken(null);
    expect(resultNull.isValid).toBe(false);
    expect(resultNull.code).toBe('TOKEN_MISSING');

    const resultEmpty = SessionValidator.validateToken('');
    expect(resultEmpty.isValid).toBe(false);
    expect(resultEmpty.code).toBe('TOKEN_MISSING');
  });

  it('debe rechazar un token con firma alterada o inválido', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    const result = SessionValidator.validateToken(fakeToken);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('TOKEN_INVALID');
  });

  it('debe rechazar un token expirado', () => {
    const expiredToken = jwt.sign(
      { sub: 'usr_123', email: 'test@example.com' },
      config.jwtSecret,
      { expiresIn: '-1s' }
    );

    const result = SessionValidator.validateToken(expiredToken);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('TOKEN_EXPIRED');
  });

  it('debe validar exitosamente un token legítimo y retornar el usuario de la sesión', () => {
    const validToken = jwt.sign(
      { sub: 'usr_abc_789', email: 'finanzas@centavo.app', name: 'Hugo' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    const result = SessionValidator.validateToken(validToken);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.user.id).toBe('usr_abc_789');
      expect(result.user.email).toBe('finanzas@centavo.app');
      expect(result.user.name).toBe('Hugo');
      expect(result.payload.sub).toBe('usr_abc_789');
    }
  });

  it('debe extraer correctamente el token desde el header Bearer', () => {
    const header = 'Bearer mi_token_jwt_aqui';
    expect(SessionValidator.extractTokenFromHeader(header)).toBe('mi_token_jwt_aqui');

    expect(SessionValidator.extractTokenFromHeader('Basic xyz')).toBeNull();
    expect(SessionValidator.extractTokenFromHeader(undefined)).toBeNull();
    expect(SessionValidator.extractTokenFromHeader('')).toBeNull();
  });
});
