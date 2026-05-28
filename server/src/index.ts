import "dotenv/config";
import express from "express";
import cors from "cors";
import { verifyToken } from "./middleware/verifyToken.js";
import { verifyOrg } from "./middleware/verifyOrg.js";

// Route modules
import auth from "./routes/auth.js";
import programs from "./routes/programs.js";
import reports from "./routes/reports.js";
import comments from "./routes/comments.js";
import users from "./routes/users.js";
import organizations from "./routes/organizations.js";
import auditLogs from "./routes/auditLogs.js";


const app = express();
app.use(cors({
  origin: [
    process.env.ALLOWED_ORIGIN ?? "https://bugspacepro.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
}));
app.use(express.json());

// ── Uptime check (public) ──────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ── Debug endpoint to check auth ───────────────────────────────────────────
app.get("/api/debug/auth", verifyToken, (req, res) => {
  res.json({
    user: req.user,
    orgId: req.headers["x-org-id"],
    hasToken: !!req.headers.authorization,
  });
});

// ── Public routes — no authentication required ────────────────────────────
// Auth must be registered BEFORE the verifyToken + verifyOrg guard so that
// POST /api/auth/login is accessible without a token.
app.use("/api/auth", auth);

// ── Protected routes — token + org validation on every request ────────────
// Sprint 1 TODO: verifyToken currently uses a demo implementation.
// Replace with Firebase Admin SDK ID token verification.
app.use("/api", verifyToken, verifyOrg);
app.use("/api/programs", programs);
app.use("/api/reports", reports);
app.use("/api/comments", comments);
app.use("/api/users", users);
app.use("/api/organizations", organizations);
app.use("/api/audit-logs", auditLogs);

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`Bugspace API listening on :${PORT}`));
