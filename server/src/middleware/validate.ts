import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Scope entry schema
export const scopeSchema = z.object({
  assetName: z.string().min(1, "Asset name is required").max(250),
  type: z.string().min(1, "Asset type is required").max(100),
  coverage: z.enum(["in-scope", "out-of-scope"]),
  maxSeverity: z.enum(["low", "medium", "high", "critical"]),
  notes: z.string().max(1000).optional().default(""),
});

// Program creation schema
export const createProgramSchema = z.object({
  name: z.string().min(1, "Program name is required").max(200, "Program name must be under 200 characters"),
  description: z.string().max(10000).optional().default(""),
  scopeSummary: z.string().max(2000).optional().default(""),
  scopes: z.array(scopeSchema).optional().default([]),
  assignedResearchers: z.array(z.string()).optional().default([]),
  assignedEmployees: z.array(z.string()).optional().default([]),
  testingGuidelines: z.string().max(5000).optional().default(""),
  status: z.enum(["draft", "active", "closed"]).optional().default("draft"),
  bannerUrl: z.string().url("Invalid banner URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  minReward: z.number().int().min(0).optional(),
  maxReward: z.number().int().min(0).optional(),
});

// Report submission schema
export const submitReportSchema = z.object({
  title: z.string().min(1, "Report title is required").max(200, "Report title must be under 200 characters"),
  programId: z.string().min(1, "Program ID is required"),
  severity: z.enum(["low", "medium", "high", "critical", "informational"]),
  vulnerabilityType: z.string().min(1, "Vulnerability type is required").max(150),
  affectedAsset: z.string().min(1, "Affected asset is required").max(250),
  description: z.string().min(1, "Description is required").max(25000),
  stepsToReproduce: z.string().min(1, "Steps to reproduce are required").max(25000),
  impact: z.string().max(10000).optional().default(""),
  proofOfConcept: z.string().max(10000).optional().default(""),
  references: z.string().max(2000).optional().default(""),
});

// Comment creation schema
export const createCommentSchema = z.object({
  body: z.string().min(1, "Comment body cannot be empty").max(5000, "Comment is too long"),
  visibility: z.enum(["internal", "researcher"]).optional().default("researcher"),
});

// Program assignment schema
export const assignProgramSchema = z.object({
  assignedResearchers: z.array(z.string()).optional(),
  assignedEmployees: z.array(z.string()).optional(),
});

/**
 * Express middleware to validate request body against a Zod schema.
 */
export function validateBody(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed.",
          details: error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
}
