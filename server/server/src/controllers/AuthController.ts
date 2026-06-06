import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { userRepo, auditLogRepo } from "../repositories/index.js";
import { adminAuth } from "../config/firebase.js";

const service = new AuthService(userRepo);
const auditService = new AuditLogService(auditLogRepo);

export const AuthController = {
  /**
   * POST /api/auth/login
   * Public endpoint used after Firebase sign-in to load the backend profile.
   * Accepts only a real Firebase ID token.
   */
  login: async (req: Request, res: Response) => {
    const { idToken } = req.body as { idToken?: string };

    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ error: "Request body must include 'idToken'." });
    }

    try {
      const result = await service.loginWithFirebaseToken(idToken);
      auditService.log({
        orgId: result.user.orgId,
        actorId: result.user.id,
        actorName: result.user.name,
        action: "LOGIN",
        targetType: "session",
        targetId: result.user.id,
      }).catch(() => {});
      return res.status(200).json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      return res.status(401).json({ error: message });
    }
  },

  /**
   * GET /api/auth/me
   * Verifies the Firebase token internally and returns the backend app profile.
   */
  me: async (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed Authorization header." });
    }

    const token = auth.slice(7);
    if (token.startsWith("demo.")) {
      return res.status(401).json({ error: "Demo tokens are disabled." });
    }

    const user = await service.me(token);
    if (!user) return res.status(401).json({ error: "Invalid or expired token." });
    return res.status(200).json({ user });
  },

  /**
   * POST /api/auth/change-password
   * Authenticated endpoint — updates the user's password in Firebase Auth and updates Firestore to requiresPasswordChange: false.
   */
  changePassword: async (req: Request, res: Response) => {
    const { password } = req.body as { password?: string };

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    try {
      const userId = req.user!.id;
      
      // Update in Firebase Auth
      await adminAuth.updateUser(userId, { password });

      // Update in Firestore
      const db = (await import("../config/firebase.js")).default.firestore();
      await db.collection("users").doc(userId).update({
        requiresPasswordChange: false,
        updatedAt: new Date().toISOString(),
      });

      // Record audit log
      auditService.log({
        orgId: req.user!.orgId,
        actorId: userId,
        actorName: req.user!.name,
        action: "PASSWORD_CHANGED",
        targetType: "user",
        targetId: userId,
      }).catch(() => {});

      return res.status(200).json({ message: "Password updated successfully." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change password.";
      return res.status(500).json({ error: message });
    }
  },
};
