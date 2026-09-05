import { IUserRepository, User, CreateUserData } from './userRepository.interface.js';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const userId = this.emailIndex.get(normalizedEmail);
    if (!userId) return null;
    const user = this.users.get(userId);
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const user: User = {
      id,
      email: normalizedEmail,
      name: data.name.trim(),
      passwordHash: data.passwordHash,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(id, user);
    this.emailIndex.set(normalizedEmail, id);
    return { ...user };
  }

  // Método auxiliar para pruebas
  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
  }
}
