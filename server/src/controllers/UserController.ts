import type { Request, Response } from "express";
import { UserService } from "../services/UserService.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { userRepo, auditLogRepo } from "../repositories/index.js";
import type { Role } from "../types/index.js";

const service = new UserService(userRepo, auditLogRepo);
const auditService = new AuditLogService(auditLogRepo);

const VALID_ROLES: Role[] = ["admin", "manager", "researcher", "employee"];

export const UserController = {
  /**
   * GET /api/users
   * Returns all users in the requesting user's organization.
   * Restricted to admin and manager roles (enforced on the route).
   */
  list: async (req: Request, res: Response) => {
    try {
      // Admin sees everyone; manager sees only their org
      const users = req.user!.role === "admin" 
        ? await service.listAll() 
        : await service.listByOrg(req.orgId!);
      return res.status(200).json(users);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to list users";
      return res.status(500).json({ error: message });
    }
  },

  /**
   * PATCH /api/users/:id/org
   * Admin-only: update a user's organization.
   * Body: { orgId: string }
   */
  updateOrg: async (req: Request, res: Response) => {
    const { orgId } = req.body as { orgId?: string };

    if (!orgId || typeof orgId !== "string") {
      return res.status(400).json({ error: "'orgId' is required." });
    }

    try {
      const updated = await service.updateOrg(req.params.id, orgId);

      if (!updated) {
        return res.status(404).json({ error: "User not found." });
      }

      // Record audit log
      await auditService.log({
        orgId: req.orgId!, // The admin's current org context
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: "USER_ORG_CHANGED",
        targetType: "user",
        targetId: req.params.id,
        targetName: updated.name,
        metadata: { newOrgId: orgId },
      });

      return res.status(200).json(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update organization";
      return res.status(500).json({ error: message });
    }
  },

  /**
   * PATCH /api/users/:id/role
   * Admin-only: update a user's role within the same org.
   * Body: { role: Role }
   */
  updateRole: async (req: Request, res: Response) => {
    const { role } = req.body as { role?: Role };

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: `'role' must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    try {
      const updated = await service.updateRole(
        req.orgId!,
        req.params.id,
        role,
        req.user!.id,
      );

      if (!updated) {
        return res.status(404).json({ error: "User not found in this organization." });
      }

      // Record audit log
      await auditService.log({
        orgId: req.orgId!,
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: "ROLE_CHANGED",
        targetType: "user",
        targetId: req.params.id,
        targetName: updated.name,
        metadata: { newRole: role },
      });

      return res.status(200).json(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update role";
      if (message.includes("cannot change your own role")) {
        return res.status(403).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  },

  /**
   * PATCH /api/users/:id/status
   * Admin-only: activate or deactivate a user account.
   * Body: { status: "active" | "inactive" }
   */
  updateStatus: async (req: Request, res: Response) => {
    const { status } = req.body as { status?: "active" | "inactive" };

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "'status' must be 'active' or 'inactive'" });
    }

    try {
      const updated = await service.updateStatus(req.orgId!, req.params.id, status, req.user!.id);

      if (!updated) {
        return res.status(404).json({ error: "User not found in this organization." });
      }

      // Record audit log
      await auditService.log({
        orgId: req.orgId!,
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: status === "inactive" ? "USER_DEACTIVATED" : "USER_ACTIVATED",
        targetType: "user",
        targetId: req.params.id,
        targetName: updated.name,
        metadata: { status },
      });

      return res.status(200).json(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      if (message.includes("cannot change your own")) {
        return res.status(403).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  },

  /**
   * DELETE /api/users/:id
   * Admin-only: permanently remove a user from the organization.
   */
  remove: async (req: Request, res: Response) => {
    try {
      // Fetch user info before deletion for the audit log
      const targetUser = await userRepo.getById(req.params.id);

      const deleted = await service.remove(req.orgId!, req.params.id, req.user!.id);

      if (!deleted) {
        return res.status(404).json({ error: "User not found in this organization." });
      }

      // Record audit log
      await auditService.log({
        orgId: req.orgId!,
        actorId: req.user!.id,
        actorName: req.user!.name,
        action: "USER_DELETED",
        targetType: "user",
        targetId: req.params.id,
        targetName: targetUser?.name ?? req.params.id,
      });

      return res.status(204).end();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      if (message.includes("cannot delete your own")) {
        return res.status(403).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  },

  /**
   * POST /api/users
   * Admin-only: pre-register a single user.
   * Body: { name: string, email: string, role: Role }
   */
  create: async (req: Request, res: Response) => {
    const { name, email, role } = req.body as { name?: string; email?: string; role?: Role };

    if (!name || !email || !role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: "Missing required fields or invalid role." });
    }

    try {
      const existing = await userRepo.getByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "User with this email already exists." });
      }

      const user = await service.create(req.orgId!, { name, email, role }, req.user!.id);
      return res.status(201).json(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      return res.status(500).json({ error: message });
    }
  },

  /**
   * POST /api/users/bulk
   * Admin-only: pre-register multiple users.
   * Body: { users: Array<{ name: string, email: string, role: Role }> }
   */
  bulkCreate: async (req: Request, res: Response) => {
    const { users } = req.body as { users?: Array<{ name: string; email: string; role: Role }> };

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "Invalid or empty users list." });
    }

    // Validate roles for all users
    const invalidUser = users.find(u => !u.name || !u.email || !u.role || !VALID_ROLES.includes(u.role));
    if (invalidUser) {
      return res.status(400).json({ error: "One or more users have invalid data or missing fields." });
    }

    try {
      await service.bulkCreate(req.orgId!, users, req.user!.id);
      return res.status(201).json({ message: `Successfully queued ${users.length} users for creation.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to bulk create users";
      return res.status(500).json({ error: message });
    }
  },
};
