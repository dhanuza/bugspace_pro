import type { Request, Response } from "express";
import { InviteService } from "../services/InviteService.js";
import { inviteRepo, userRepo, auditLogRepo } from "../repositories/index.js";
import type { Role } from "../types/index.js";
import { adminAuth } from "../config/firebase.js";

const inviteService = new InviteService(inviteRepo, userRepo, auditLogRepo);

const VALID_ROLES: Role[] = ["admin", "manager", "researcher", "employee"];

/**
 * Determine the frontend URL for invite links.
 * Uses FRONTEND_URL env var or falls back to the request origin.
 */
function getFrontendUrl(req: Request): string {
  return (
    process.env.FRONTEND_URL ||
    req.headers.origin ||
    req.headers.referer?.replace(/\/+$/, "") ||
    "http://localhost:5173"
  );
}

export const InviteController = {
  /**
   * POST /api/invites
   * Admin-only: send a single invite.
   * Body: { name, email, role }
   */
  create: async (req: Request, res: Response) => {
    const { name, email, role } = req.body as {
      name?: string;
      email?: string;
      role?: Role;
    };

    if (!name || !email || !role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: "Missing required fields or invalid role." });
    }

    try {
      const invite = await inviteService.createInvite(
        req.orgId!,
        { name, email, role },
        req.user!.id,
        getFrontendUrl(req),
      );
      return res.status(201).json(invite);
    } catch (err: any) {
      const message = err.message || "Failed to create invite.";
      const status = message.includes("already") ? 409 : 500;
      return res.status(status).json({ error: message });
    }
  },

  /**
   * POST /api/invites/bulk
   * Admin-only: send bulk invites.
   * Body: { users: [{ name, email, role }] }
   */
  bulkCreate: async (req: Request, res: Response) => {
    const { users } = req.body as {
      users?: Array<{ name: string; email: string; role: Role }>;
    };

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "Invalid or empty users list." });
    }

    const invalid = users.find(
      (u) => !u.name || !u.email || !u.role || !VALID_ROLES.includes(u.role),
    );
    if (invalid) {
      return res.status(400).json({ error: "One or more users have invalid data." });
    }

    try {
      const result = await inviteService.bulkInvite(
        req.orgId!,
        users,
        req.user!.id,
        getFrontendUrl(req),
      );
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to send bulk invites." });
    }
  },

  /**
   * GET /api/invites/validate/:token
   * Public endpoint — validates an invite token.
   */
  validate: async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ valid: false, error: "Invalid token." });
    }

    try {
      const result = await inviteService.validateToken(token);
      if (!result.valid) {
        return res.status(200).json({ valid: false, error: result.error });
      }
      // Return limited info — don't expose the full invite object
      return res.status(200).json({
        valid: true,
        email: result.invite!.email,
        name: result.invite!.name,
        role: result.invite!.role,
      });
    } catch (err: any) {
      return res.status(500).json({ valid: false, error: "Failed to validate invite." });
    }
  },

  /**
   * POST /api/invites/accept
   * Public endpoint — accepts an invite after Firebase auth.
   * Body: { token, idToken }
   */
  accept: async (req: Request, res: Response) => {
    const { token, idToken } = req.body as { token?: string; idToken?: string };

    if (!token || !idToken) {
      return res.status(400).json({ error: "Missing token or idToken." });
    }

    try {
      // Verify the Firebase ID token to get the user's email
      const decoded = await adminAuth.verifyIdToken(idToken);
      if (!decoded.email) {
        return res.status(400).json({ error: "Firebase account has no email." });
      }

      const authProvider = decoded.firebase?.sign_in_provider === "google.com" ? "google" : "email";

      const result = await inviteService.acceptInvite(
        token,
        decoded.uid,
        decoded.email,
        authProvider,
      );

      if (!result.success) {
        return res.status(403).json({ error: result.error });
      }

      // Now fetch the activated user to return their profile
      const user = await userRepo.getById(decoded.uid);
      return res.status(200).json({ user });
    } catch (err: any) {
      console.error("[InviteController.accept] Error:", err);
      return res.status(500).json({ error: "Failed to accept invite." });
    }
  },

  /**
   * POST /api/invites/:id/resend
   * Admin-only: resend an invite email with a fresh token.
   */
  resend: async (req: Request, res: Response) => {
    try {
      const invite = await inviteService.resendInvite(
        req.params.id,
        req.user!.id,
        getFrontendUrl(req),
      );
      return res.status(200).json(invite);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Failed to resend invite." });
    }
  },

  /**
   * DELETE /api/invites/:id
   * Admin-only: revoke/delete an invite.
   */
  remove: async (req: Request, res: Response) => {
    try {
      await inviteRepo.revoke(req.params.id);
      return res.status(204).end();
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to delete invite." });
    }
  },

  /**
   * GET /api/invites
   * Admin-only: list all invites for the org.
   */
  list: async (req: Request, res: Response) => {
    try {
      const invites = await inviteRepo.listByOrg(req.orgId!);
      return res.status(200).json(invites);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to list invites." });
    }
  },
};
