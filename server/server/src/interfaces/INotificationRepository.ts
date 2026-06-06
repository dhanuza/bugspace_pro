import type { Notification } from "../types/index.js";

export interface INotificationRepository {
  list(orgId: string, userId: string): Promise<Notification[]>;
  create(orgId: string, input: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification>;
  markAsRead(orgId: string, userId: string, id: string): Promise<Notification | null>;
  markAllAsRead(orgId: string, userId: string): Promise<boolean>;
  countUnread(orgId: string, userId: string): Promise<number>;
}
