import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { IUserRepository, User } from '../../repositories/userRepository.interface.js';
import { RegisterInput, LoginInput } from './auth.schemas.js';
import { SessionValidator, SessionValidationResult } from '../session/sessionValidator.js';
import { logger } from '../../utils/logger.js';

/**
 * Justificación de Hashing (AGENTS.md):
 * Factor de costo (salt rounds) = 10 con bcryptjs:
 * Proporciona resistencia comprobada contra ataques de fuerza bruta y diccionarios,
 * genera sales criptográficas únicas por usuario y previene timing attacks.
 */
const BCRYPT_SALT_ROUNDS = 10;

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Registra un nuevo usuario con contraseña cifrada (bcrypt, 10 rounds)
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      logger.warn('Intento de registro con correo ya registrado', { email: input.email });
      throw new Error('El correo electrónico ya se encuentra registrado');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    logger.info('Usuario registrado exitosamente', { userId: user.id });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Inicia sesión validando credenciales de forma segura
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      logger.warn('Intento de inicio de sesión con usuario inexistente', { email: input.email });
      throw new Error('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      logger.warn('Intento de inicio de sesión con contraseña incorrecta', { email: input.email });
      throw new Error('Credenciales inválidas');
    }

    logger.info('Inicio de sesión exitoso', { userId: user.id });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Valida la sesión delegando al módulo central SessionValidator
   * (Cumplimiento de regla AGENTS.md)
   */
  verifySession(token: string | undefined | null): SessionValidationResult {
    return SessionValidator.validateToken(token);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getUserProfile(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Generación segura de tokens JWT
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as unknown as SignOptions['expiresIn']
    });
  }
}
