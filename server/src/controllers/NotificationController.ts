import type { Request, Response } from "express";
import { notificationRepo } from "../repositories/index.js";
import { NotificationService } from "../services/NotificationService.js";

const service = new NotificationService(notificationRepo);

export const NotificationController = {
  /**
   * GET /api/notifications
   * Returns all notifications for the current authenticated user.
   */
  list: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const notifications = await service.listForUser(orgId, user.id);
    return res.json({ notifications });
  },

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read.
   */
  markRead: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const { id } = req.params;
    const notification = await service.markAsRead(orgId, user.id, id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }
    return res.json({ notification });
  },

  /**
   * PATCH /api/notifications/read-all
   * Marks all unread notifications for the current user as read.
   */
  markAllRead: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    await service.markAllAsRead(orgId, user.id);
    return res.json({ ok: true });
  },
};
