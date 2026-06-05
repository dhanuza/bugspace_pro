import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

/** GET /api/users — list all users in the org (admin + manager) */
router.get("/", verifyRole("admin", "manager"), UserController.list);

/** PATCH /api/users/:id/role — update a user's role (admin only) */
router.patch("/:id/role", verifyRole("admin"), UserController.updateRole);

/** PATCH /api/users/:id/status — activate or deactivate a user (admin only) */
router.patch("/:id/status", verifyRole("admin"), UserController.updateStatus);

/** PATCH /api/users/:id/org — update a user's organization (admin only) */
router.patch("/:id/org", verifyRole("admin"), UserController.updateOrg);

/** DELETE /api/users/:id — permanently remove a user (admin only) */
router.delete("/:id", verifyRole("admin"), UserController.remove);

/** POST /api/users — pre-register a user (admin only) */
router.post("/", verifyRole("admin"), UserController.create);

/** POST /api/users/bulk — bulk pre-register users (admin only) */
router.post("/bulk", verifyRole("admin"), UserController.bulkCreate);

export default router;
