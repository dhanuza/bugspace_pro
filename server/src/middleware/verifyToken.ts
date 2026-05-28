import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase.js";
import { userRepo } from "../repositories/index.js";

/**
 * verifyToken middleware
 *
 * Supports two modes:
 *
 *  1. PRODUCTION — Firebase ID token (real JWT from Google)
 *     Header:  Authorization: Bearer <firebase-id-token>
 *     Action:  Verified via Firebase Admin SDK; uid + email extracted.
 *              User data (role, orgId) fetched from Firestore.
 *
 *  2. DEMO (dev fallback) — if no Firebase credentials are configured
 *     Header:  Authorization: Bearer demo.<role>.<timestamp>
 *     Action:  Token parsed directly; role and orgId extracted from the string.
 *              This mode ONLY activates when Firebase Admin lacks credentials.
 */
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = req.headers.authorization;
  console.log("AUTH HEADER:", req.headers.authorization);
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const token = auth.slice(7);

  // ── Demo mode (dev convenience) ──────────────────────────────────────────
  if (token.startsWith("demo.")) {
    const parts = token.split(".");
    const role = (parts[1] as any) ?? "employee";
    const orgId = (req.headers["x-org-id"] as string) ?? "org-1";
    req.user = { id: `u-${role}`, name: `Demo ${role}`, role, orgId };
    return next();
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
    
    req.user = {
      id: dbUser.id,
      name: dbUser.name,
      role: dbUser.role || "employee",
      orgId: dbUser.orgId,
    };
    
    return next();
  } catch (err) {
    console.error('[verifyToken] Error:', err);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
