import { Router } from "express";
import { InviteController } from "../controllers/InviteController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

/** GET /api/invites — list all invites for the org (admin only) */
router.get("/", verifyRole("admin"), InviteController.list);

/** POST /api/invites — send a single invite (admin only) */
router.post("/", verifyRole("admin"), InviteController.create);

/** POST /api/invites/bulk — send bulk invites (admin only) */
router.post("/bulk", verifyRole("admin"), InviteController.bulkCreate);

/** POST /api/invites/:id/resend — resend an invite (admin only) */
router.post("/:id/resend", verifyRole("admin"), InviteController.resend);

/** DELETE /api/invites/:id — revoke an invite (admin only) */
router.delete("/:id", verifyRole("admin"), InviteController.remove);

export default router;
