// backend/routes/reports.js
import { Router } from "express";
import { ReportController } from "../controllers/ReportController.js";

const router = Router();

router.get("/", ReportController.list);
router.get("/:id", ReportController.get);

export default router;
