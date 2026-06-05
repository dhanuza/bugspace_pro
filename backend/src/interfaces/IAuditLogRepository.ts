import type { AuditLog } from "../types/index.js";

export interface IAuditLogRepository {
  /** Append a new immutable audit log entry. */
  append(entry: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
  /** List logs for an org, most-recent first. */
  listByOrg(orgId: string): Promise<AuditLog[]>;
  /** List all logs across all organizations (Admin only). */
  listAll(): Promise<AuditLog[]>;
}
