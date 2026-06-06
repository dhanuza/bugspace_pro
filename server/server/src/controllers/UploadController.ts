import { Request, Response } from "express";
import admin from "../config/firebase.js";
import { reportRepo } from "../repositories/index.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf", ".txt"
]);

const DANGEROUS_EXTENSIONS = /\.(exe|bat|cmd|sh|msi|vbs|js|vbe|jse|wsf|wsh|py|pl|rb|php|asp|aspx|jsp|jar)$/i;

const MIME_EXTENSIONS: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

function sanitizeFilename(name: string): string {
  // Replace characters not in [a-zA-Z0-9.-_] with underscore
  return name.replace(/[^a-zA-Z0-9.-_]/g, "_");
}

export const UploadController = {
  /**
   * POST /api/uploads/evidence
   * Returns a signed Firebase Storage URL the client can PUT the file to.
   * The actual file never passes through the backend — it goes directly
   * from the browser to Firebase Storage via the signed URL.
   *
   * Validates: MIME type, extension, file size, filename safety — before signing.
   */
  getSignedUrl: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const { reportId, filename, contentType, size } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ error: "Filename is required." });
    }
    if (!contentType || typeof contentType !== "string") {
      return res.status(400).json({ error: "Content-Type is required." });
    }
    if (!reportId || typeof reportId !== "string") {
      return res.status(400).json({ error: "reportId is required." });
    }
    if (typeof size !== "number" || size <= 0) {
      return res.status(400).json({ error: "File size must be a positive number." });
    }

    // ── Size limit ──────────────────────────────────────────────────────────
    if (size > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        error: `File exceeds maximum allowed size of 15MB.`,
      });
    }

    // ── MIME type whitelist ─────────────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return res.status(400).json({
        error: `File type "${contentType}" is not allowed.`,
      });
    }

    // ── Extension blacklist ─────────────────────────────────────────────────
    if (DANGEROUS_EXTENSIONS.test(filename)) {
      return res.status(400).json({
        error: `File extension is not permitted for security reasons.`,
      });
    }

    const lowerName = filename.toLowerCase();
    const parts = lowerName.split(".");
    const ext = parts.length > 1 ? `.${parts.at(-1)}` : "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({ error: "File extension is not allowed." });
    }
    if (parts.length > 2) {
      return res.status(400).json({ error: "Multiple file extensions are not allowed." });
    }
    if (MIME_EXTENSIONS[contentType] && !MIME_EXTENSIONS[contentType].includes(ext)) {
      return res.status(400).json({ error: "File extension does not match Content-Type." });
    }

    // ── Null byte / path traversal check ───────────────────────────────────
    if (filename.includes("\0") || filename.includes("..")) {
      return res.status(400).json({ error: "Invalid filename." });
    }

    // ── Verify report belongs to the org and user has access ───────────────
    const report = await reportRepo.get(orgId, reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }
    if (user.role === "researcher" && report.reporterId !== user.id) {
      return res.status(403).json({ error: "Not authorized to upload evidence for this report." });
    }

    const safe = sanitizeFilename(filename);
    const storagePath = `evidence/${orgId}/${reportId}/${Date.now()}-${safe}`;

    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(storagePath);

      const [signedUrl] = await file.generateSignedPostPolicyV4({
        expires: Date.now() + 15 * 60 * 1000, // 15 minute window
        conditions: [
          ["content-length-range", 1, MAX_FILE_SIZE_BYTES],
          ["eq", "$Content-Type", contentType],
        ],
        fields: {
          "Content-Type": contentType,
        },
      });

      return res.json({
        uploadUrl: signedUrl.url,
        fields: signedUrl.fields,
        storagePath,
        publicUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
      });
    } catch (error) {
      console.error("[UploadController] Failed to generate signed URL:", error);
      return res.status(500).json({ error: "Could not prepare upload. Please try again." });
    }
  },

  /**
   * POST /api/uploads/program-image
   * Directly uploads a program banner or logo by receiving base64Data on the server
   * and saving it to Firebase Storage. This completely avoids client-side CORS issues.
   */
  uploadProgramImageDirect: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers can upload program images." });
    }

    const { programId, filename, contentType, base64Data, imageType } = req.body;

    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ error: "Filename is required." });
    }
    if (!contentType || typeof contentType !== "string") {
      return res.status(400).json({ error: "Content-Type is required." });
    }
    if (!base64Data || typeof base64Data !== "string") {
      return res.status(400).json({ error: "base64Data is required." });
    }
    if (!imageType || !["banner", "logo"].includes(imageType)) {
      return res.status(400).json({ error: "imageType must be 'banner' or 'logo'." });
    }

    const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return res.status(400).json({ error: "Only PNG, JPEG, WebP, and GIF images are allowed." });
    }

    try {
      const buffer = Buffer.from(base64Data, "base64");
      const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
      if (buffer.length > MAX_IMAGE_SIZE) {
        return res.status(400).json({ error: "Image exceeds maximum size of 5 MB." });
      }

      const safe = sanitizeFilename(filename);
      const folder = imageType === "banner" ? "program-banners" : "program-logos";
      const idSegment = programId ? `${programId}/` : "";
      const storagePath = `${folder}/${orgId}/${idSegment}${Date.now()}-${safe}`;

      const bucket = admin.storage().bucket();
      const file = bucket.file(storagePath);

      // Save file buffer directly using the Admin SDK (server-side, so no CORS)
      await file.save(buffer, {
        metadata: {
          contentType: contentType,
        },
      });

      // Construct a standardized public download URL for Firebase Storage
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

      return res.json({ publicUrl });
    } catch (error) {
      console.error("[UploadController] Failed to upload program image directly:", error);
      return res.status(500).json({ error: "Could not upload image. Please try again." });
    }
  },
};
