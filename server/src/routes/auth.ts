import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";

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

export default router;
