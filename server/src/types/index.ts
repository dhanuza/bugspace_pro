export type Role = "admin" | "manager" | "researcher" | "employee";
export type ReportStatus = "New" | "Needs Info" | "Triaged" | "Valid" | "Duplicate" | "Closed";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  orgId: string;
  assignedPrograms?: string[];
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
  role: Role;
  orgId: string;
  assignedPrograms?: string[];
  status?: "active" | "inactive";
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  scope: string;
  active: boolean;
  orgId: string;
}

export interface Report {
  id: string;
  title: string;
  programId: string;
  programName: string;
  severity: "low" | "medium" | "high" | "critical";
  status: ReportStatus;
  reporterId: string;
  reporterName: string;
  description: string;
  createdAt: string;
  orgId: string;
}

export interface Comment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  body: string;
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

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      orgId?: string;
    }
  }
}
