import { Router } from "express";
import { ProgramController } from "../controllers/ProgramController.js";
import { validateBody, createProgramSchema, assignProgramSchema } from "../middleware/validate.js";

const router = Router();

router.get("/", ProgramController.list);
router.get("/:id", ProgramController.get);
router.post("/", validateBody(createProgramSchema), ProgramController.create);
router.patch("/:id", validateBody(createProgramSchema.partial()), ProgramController.update);
router.delete("/:id", ProgramController.remove);
router.get("/:id/participants", ProgramController.getParticipants);
router.post("/:id/assign", validateBody(assignProgramSchema), ProgramController.assign);

export default router;
