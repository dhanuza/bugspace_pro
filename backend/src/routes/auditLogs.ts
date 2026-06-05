import { Router } from "express";
import { AuditLogController } from "../controllers/AuditLogController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

/**
 * GET /api/audit-logs
 * Admin and manager — read-only. No write endpoints exist.
 */
router.get("/", verifyRole("admin", "manager"), AuditLogController.list);

export default router;
