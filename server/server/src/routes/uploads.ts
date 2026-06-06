import { Router } from "express";
import { UploadController } from "../controllers/UploadController.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

// Tight rate limit on uploads: max 20 signed URL requests per 15 min
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many upload requests. Please try again later." },
});

/** POST /api/uploads/evidence — request a signed URL for evidence upload */
router.post("/evidence", uploadLimiter, UploadController.getSignedUrl);

/** POST /api/uploads/program-image — direct base64 program banner/logo upload */
router.post("/program-image", uploadLimiter, UploadController.uploadProgramImageDirect);

export default router;
