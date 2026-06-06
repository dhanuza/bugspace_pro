export type Role = "admin" | "manager" | "researcher" | "employee";
export type ReportStatus = "New" | "Needs Info" | "Triaged" | "Valid" | "Duplicate" | "Closed";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  orgId: string;
  requiresPasswordChange?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: Role;
  orgId: string;
  status?: "active" | "inactive" | "invited" | "disabled";
  /** Auth provider used for activation (google, email) */
  authProvider?: string;
  /** ISO 8601 timestamp of last login */
  lastLoginAt?: string;
  /** ISO 8601 timestamp of invite sent */
  inviteSentAt?: string;
  createdAt: string;
  updatedAt?: string;
  requiresPasswordChange?: boolean;
}

export interface Invite {
  id: string;
  email: string;
  name: string;
  role: Role;
  orgId: string;
  token: string;
  status: "pending" | "used" | "expired" | "revoked";
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string;
}

export type ProgramStatus = "draft" | "active" | "closed";

export interface ProgramScope {
  assetName: string;
  type: string;
  coverage: "in-scope" | "out-of-scope";
  maxSeverity: "low" | "medium" | "high" | "critical";
  notes: string;
}

export interface Program {
  id: string;
  orgId: string;

  name: string;
  description: string;
  scopeSummary: string;

  scopes: ProgramScope[];

  assignedResearchers: string[];
  assignedEmployees: string[];

  testingGuidelines: string;

  managerId: string;

  status: ProgramStatus;

  /** Program banner image URL (Firebase Storage public URL) */
  bannerUrl?: string;
  /** Program logo/company image URL */
  logoUrl?: string;
  /** Minimum bounty reward in INR */
  minReward?: number;
  /** Maximum bounty reward in INR */
  maxReward?: number;

  createdAt: string;
  updatedAt: string;
}

export type Severity = "low" | "medium" | "high" | "critical" | "informational";

export interface Report {
  id: string;
  title: string;
  programId: string;
  programName: string;
  severity: Severity;
  status: ReportStatus;
  reporterId: string;
  reporterName: string;
  description: string;
  vulnerabilityType: string;
  affectedAsset: string;
  stepsToReproduce: string;
  impact: string;
  proofOfConcept: string;
  references: string;
  createdAt: string;
  updatedAt: string;
  orgId: string;
}

export interface Comment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  authorRole?: Role;
  body: string;
  visibility: "internal" | "researcher";
  createdAt: string;
  orgId: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  orgId: string;
  userId: string;
  type: "needs_info" | "status_updated" | "assigned" | "comment_added";
  title: string;
  message: string;
  reportId: string;
  read: boolean;
  createdAt: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      orgId?: string;
    }
  }
}
