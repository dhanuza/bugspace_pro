import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase.js";
import { userRepo } from "../repositories/index.js";

/**
 * verifyToken middleware
 *
 * Production authentication only:
 *   Header: Authorization: Bearer <firebase-id-token>
 *   Action: Firebase Admin verifies the token, then role/org/status are loaded
 *   from Firestore. Firestore is the source of truth for authorization.
 */
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const token = auth.slice(7);

  if (token.startsWith("demo.")) {
    return res.status(401).json({ error: "Demo tokens are disabled." });
  }

  // ── Firebase JWT verification ─────────────────────────────────────────────
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    
    // Fetch user from database to get role and orgId
    const dbUser = await userRepo.getById(decoded.uid);
    
    if (!dbUser) {
      console.log('[verifyToken] User not found in database:', decoded.uid);
      return res.status(401).json({ error: "User not found in database." });
    }
    
    console.log('[verifyToken] User from DB:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      orgId: dbUser.orgId,
      status: dbUser.status
    });
    
    if (!dbUser.role) {
      return res.status(403).json({ error: "User role has not been assigned." });
    }

    if (dbUser.status !== "active") {
      return res.status(403).json({ error: "User account is not active." });
    }

    // Bulletproof session verification: if they must change their password, block all other APIs
    if (
      dbUser.requiresPasswordChange &&
      !req.originalUrl.includes("/auth/change-password") &&
      !req.originalUrl.includes("/auth/me") &&
      !req.originalUrl.includes("/auth/login")
    ) {
      return res.status(403).json({ error: "Password change required." });
    }

    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      role: dbUser.role,
      orgId: dbUser.orgId,
      requiresPasswordChange: dbUser.requiresPasswordChange,
    };
    
    return next();
  } catch (err) {
    console.error('[verifyToken] Error:', err);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
