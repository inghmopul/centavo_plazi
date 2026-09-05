import { Notification, CreateNotificationData } from '../types/notification.types.js';

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>;
  findAllByUserId(userId: string): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(id: string, userId: string): Promise<boolean>;
  delete(id: string, userId: string): Promise<boolean>;
}
