import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
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
import notifications from "./routes/notifications.js";
import dashboard from "./routes/dashboard.js";
import uploads from "./routes/uploads.js";
import invites from "./routes/invites.js";
import { InviteController } from "./controllers/InviteController.js";

const app = express();

// ── Security headers — Helmet ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith("http://localhost:")) return callback(null, true);

    const allowedOrigins = [
      process.env.ALLOWED_ORIGIN ?? "https://bugspacepro.netlify.app",
      "https://sensational-empanada-d636ef.netlify.app",
      "https://deft-croissant-a0fa16.netlify.app",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

// ── Rate limiters ──────────────────────────────────────────────────────────
// Strict limiter for auth endpoints (login, token exchange)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

// Standard API limiter for all protected routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

// Tight limiter for report submission and comments
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Submission rate limit reached. Please wait before submitting again." },
});

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
app.use("/api/auth", authLimiter, auth);

// Public invite endpoints (validate and accept don't require auth)
app.get("/api/invites/validate/:token", authLimiter, InviteController.validate);
app.post("/api/invites/accept", authLimiter, InviteController.accept);

// ── Protected routes — token + org validation on every request ────────────
app.use("/api", apiLimiter, verifyToken, verifyOrg);

// Report submission and comment creation get a tighter rate limit
app.use("/api/reports", (req, res, next) => {
  if (req.method === "POST") return submitLimiter(req, res, next);
  return next();
});

app.use("/api/programs", programs);
app.use("/api/reports", reports);
app.use("/api/comments", comments);
app.use("/api/users", users);
app.use("/api/organizations", organizations);
app.use("/api/audit-logs", auditLogs);
app.use("/api/notifications", notifications);
app.use("/api/dashboard", dashboard);
app.use("/api/uploads", uploads);
app.use("/api/invites", invites);

// ── Global error handler ───────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[GlobalError]", err.message);
  res.status(500).json({ error: "An unexpected error occurred." });
});

// ── Process-level Error Safety ─────────────────────────────────────────────
process.on("unhandledRejection", (reason: any) => {
  console.error("[UnhandledRejection] Safe Catch:", reason?.message || reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("[UncaughtException] Safe Catch:", error.message);
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`Bugspace API listening on :${PORT}`));

