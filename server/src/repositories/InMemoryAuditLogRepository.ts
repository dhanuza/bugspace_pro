import type { IAuditLogRepository } from "../interfaces/IAuditLogRepository.js";
import type { AuditLog } from "../types/index.js";

// Append-only in-memory store. Replace with FirestoreAuditLogRepository in Sprint 3.
const db: AuditLog[] = [];

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  async append(entry: Omit<AuditLog, "id" | "createdAt">) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    db.push(log);
    return log;
  }

  async listByOrg(orgId: string) {
    return [...db]
      .filter((l) => l.orgId === orgId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
  }
 
  async listAll() {
    return [...db].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
