import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

/**
 * POST /api/auth/login
 * Public — no verifyToken middleware. Accepts { role } and returns { token, user }.
 * Sprint 1 TODO: body will carry a Firebase idToken instead of a plain role.
 */
router.post("/login", AuthController.login);

/**
 * GET /api/auth/me
 * Semi-public — verifies the Bearer token internally (AuthService.me).
 * Not wrapped in the global verifyToken + verifyOrg middleware chain because
 * the /me call is what the client uses to bootstrap org context on first load.
 */
router.get("/me", AuthController.me);

/**
 * POST /api/auth/change-password
 * Authenticated — updates user password in Auth and Firestore.
 */
router.post("/change-password", verifyToken, AuthController.changePassword);

export default router;
