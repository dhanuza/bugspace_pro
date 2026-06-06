import { Router } from "express";
// Comments are accessed via /api/reports/:id/comments. This module reserved for future flat queries.
const router = Router();
router.get("/", (_req, res) => res.json([]));
export default router;
