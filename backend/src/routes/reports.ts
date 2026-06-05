import { Router } from "express";
import { ReportController } from "../controllers/ReportController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();
router.get("/", ReportController.list);
router.get("/:id", ReportController.get);
router.post("/", ReportController.create);
router.patch(
  "/:id/status",
  verifyRole("admin", "manager", "employee"), 
  ReportController.updateStatus
);
router.get("/:id/comments", ReportController.listComments);
router.post("/:id/comments", ReportController.addComment);
export default router;
