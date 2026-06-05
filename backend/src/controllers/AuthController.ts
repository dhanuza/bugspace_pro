import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { userRepo, auditLogRepo } from "../repositories/index.js";

const service = new AuthService(userRepo);
const auditService = new AuditLogService(auditLogRepo);

export const AuthController = {
  /**
   * POST /api/auth/login  (public — no verifyToken guard)
   *
   * Accepts either:
   *   { idToken: string }  — Real Firebase ID token (production)
   *   { role: string }     — Demo role string (dev mode, no Firebase creds)
   *
   * Returns { user: AppUser } with the app-level profile (role, orgId).
   */
  login: async (req: Request, res: Response) => {
    const { idToken, role } = req.body as { idToken?: string; role?: string };

    // ── Production path — Firebase ID token ──────────────────────────────
    if (idToken && typeof idToken === "string") {
      try {
        const result = await service.loginWithFirebaseToken(idToken);
        // Record login audit log (non-blocking)
        auditService.log({
          orgId: result.user.orgId,
          actorId: result.user.id,
          actorName: result.user.name,
          action: "LOGIN",
          targetType: "session",
          targetId: result.user.id,
        }).catch(() => {}); // fire-and-forget, don't fail login if audit fails
        return res.status(200).json(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        return res.status(401).json({ error: message });
      }
    }

    // ── Demo path — role string (only when idToken is absent) ────────────
    if (role && typeof role === "string") {
      try {
        const result = await service.loginDemo(role);
        return res.status(200).json(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Demo login failed";
        return res.status(401).json({ error: message });
      }
    }

    return res.status(400).json({
      error: "Request body must include either 'idToken' (Firebase) or 'role' (demo).",
    });
  },

  /**
   * GET /api/auth/me  (public — verifies token internally)
   *
   * Returns the authenticated user's app profile.
   * Accepts the same Firebase ID token in the Authorization header.
   */
  me: async (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed Authorization header." });
    }

    const token = auth.slice(7);

    // Demo token — parse directly.
    if (token.startsWith("demo.")) {
      const role = token.split(".")[1];
      const user = await userRepo.getByEmail(`${role}@bugspace.io`);
      if (!user) return res.status(401).json({ error: "Demo user not found." });
      return res.status(200).json(user);
    }

    // Firebase token — verify via Admin SDK.
    const user = await service.me(token);
    if (!user) return res.status(401).json({ error: "Invalid or expired token." });
    return res.status(200).json(user);
  },
};
