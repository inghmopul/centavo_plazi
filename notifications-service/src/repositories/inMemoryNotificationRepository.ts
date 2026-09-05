import { INotificationRepository } from './notificationRepository.interface.js';
import { Notification, CreateNotificationData } from '../types/notification.types.js';

export class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Map<string, Notification> = new Map();

  async create(data: CreateNotificationData): Promise<Notification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const notification: Notification = {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      category: data.category,
      channel: data.channel || 'IN_APP',
      metadata: data.metadata,
      read: false,
      createdAt: now
    };

    this.notifications.set(id, notification);
    return { ...notification };
  }

  async findAllByUserId(userId: string): Promise<Notification[]> {
    const list: Notification[] = [];
    for (const item of this.notifications.values()) {
      if (item.userId === userId || userId === 'all' || !userId) {
        list.push({ ...item });
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Notification | null> {
    const notif = this.notifications.get(id);
    return notif ? { ...notif } : null;
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const notif = this.notifications.get(id);
    if (!notif || (notif.userId !== userId && userId !== 'all')) {
      return false;
    }
    notif.read = true;
    this.notifications.set(id, notif);
    return true;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const notif = this.notifications.get(id);
    if (!notif || (notif.userId !== userId && userId !== 'all')) {
      return false;
    }
    return this.notifications.delete(id);
  }

  clear(): void {
    this.notifications.clear();
  }
}
