import type { Request, Response } from "express";
import { AuditLogService } from "../services/AuditLogService.js";
import { auditLogRepo } from "../repositories/index.js";

const service = new AuditLogService(auditLogRepo);

export const AuditLogController = {
  /**
   * GET /api/audit-logs
   * Returns all audit logs for the requesting user's org.
   * Read-only — no POST/PATCH/DELETE endpoints exist (append-only by design).
   */
  list: async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit ?? 50);
      const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
      const options = { limit, cursor };

      // Admins see everything; managers/others see only their org
      const logs = req.user!.role === "admin"
        ? await service.listAll()
        : await service.listByOrg(req.user!.orgId, options);
      return res.status(200).json(logs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch logs";
      return res.status(500).json({ error: message });
    }
  },
};
