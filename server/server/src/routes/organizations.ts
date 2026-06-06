import { Router } from "express";
import { OrganizationController } from "../controllers/OrganizationController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

/**
 * GET /api/organizations
 * Admin-only: list all organizations.
 * In a multi-tenant SaaS, regular users can only see their own org.
 */
router.get("/", verifyRole("admin"), OrganizationController.list);

/**
 * GET /api/organizations/:id
 * Admin and manager can look up a specific org by ID.
 */
router.get("/:id", verifyRole("admin", "manager"), OrganizationController.get);

/**
 * POST /api/organizations
 * Admin-only: create a new tenant organization.
 */
router.post("/", verifyRole("admin"), OrganizationController.create);

export default router;
