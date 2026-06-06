import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController.js";

const router = Router();

/** GET /api/notifications — list current user's notifications */
router.get("/", NotificationController.list);

/** PATCH /api/notifications/read-all — mark all as read (must be before /:id) */
router.patch("/read-all", NotificationController.markAllRead);

/** PATCH /api/notifications/:id/read — mark single notification as read */
router.patch("/:id/read", NotificationController.markRead);

export default router;
