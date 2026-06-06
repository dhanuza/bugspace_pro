import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

/** GET /api/dashboard/manager — aggregated manager stats */
router.get("/manager", verifyRole("manager", "admin"), DashboardController.manager);

/** GET /api/dashboard/researcher — aggregated researcher stats */
router.get("/researcher", verifyRole("researcher"), DashboardController.researcher);

export default router;
