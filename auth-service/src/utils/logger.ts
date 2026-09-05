/**
 * Utilidad de logging seguro para auth-service.
 * REGLA AGENTS.md: Nunca loguear credenciales ni tokens en texto plano.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'contrasena',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'jwt',
  'bearer',
  'credentials'
]);

function maskValue(val: unknown): unknown {
  if (typeof val === 'string') {
    if (val.length === 0) return '';
    return '[PROTEGIDO]';
  }
  return '[PROTEGIDO]';
}

export function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('token')) {
      sanitized[key] = maskValue(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  info: (message: string, meta?: unknown) => {
    if (meta !== undefined) {
      console.log(`[INFO] ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.log(`[INFO] ${message}`);
    }
  },
  warn: (message: string, meta?: unknown) => {
    if (meta !== undefined) {
      console.warn(`[WARN] ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  error: (message: string, meta?: unknown) => {
    if (meta !== undefined) {
      console.error(`[ERROR] ${message}`, JSON.stringify(sanitize(meta)));
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      if (meta !== undefined) {
        console.debug(`[DEBUG] ${message}`, JSON.stringify(sanitize(meta)));
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }
};
