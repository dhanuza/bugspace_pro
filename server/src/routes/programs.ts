import { Router } from "express";
import { ProgramController } from "../controllers/ProgramController.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();
router.get("/", ProgramController.list);
router.get("/:id", ProgramController.get);
router.post("/", verifyRole("admin", "manager"), ProgramController.create);
export default router;
