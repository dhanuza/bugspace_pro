export type Role = "admin" | "manager" | "researcher" | "employee";

export type ReportStatus =
  | "New"
  | "Needs Info"
  | "Triaged"
  | "Valid"
  | "Duplicate"
  | "Closed";

export type Severity = "low" | "medium" | "high" | "critical";

export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  /** ISO 8601 creation timestamp */
  createdAt?: string;
  /** Google profile photo URL */
  photoURL?: string | null;
  /** Account lifecycle status */
  status?: UserStatus;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt: string;
  createdBy: string;
  counts?: {
    manager: number;
    researcher: number;
    employee: number;
    total: number;
  };
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

export interface Program {
  id: string;
  name: string;
  scope: string;
  active: boolean;
  orgId: string;
}

export interface Comment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

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
  createdAt: string;
  orgId: string;
}

// Re-export extended user type for convenience
export type { AppUser, UserStatus as AppUserStatus } from "./user.types";