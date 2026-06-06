import { Router } from "express";
import { ReportController } from "../controllers/ReportController.js";
import { verifyRole } from "../middleware/verifyRole.js";
import { validateBody, submitReportSchema, createCommentSchema } from "../middleware/validate.js";

const router = Router();
router.get("/", ReportController.list);
router.get("/:id", ReportController.get);
router.post("/", validateBody(submitReportSchema), ReportController.create);
router.patch("/:id/status", verifyRole("admin", "manager"), ReportController.updateStatus);
router.post("/:id/assign", verifyRole("admin", "manager"), ReportController.assignEmployee);
router.patch("/:id/workflow", verifyRole("admin", "manager"), ReportController.updateWorkflowStatus);
router.get("/:id/comments", ReportController.listComments);
router.post("/:id/comments", validateBody(createCommentSchema), ReportController.addComment);
export default router;
