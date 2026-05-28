import type { IAuditLogRepository } from "../interfaces/IAuditLogRepository.js";

export class AuditLogService {
  constructor(private repo: IAuditLogRepository) {}

  /**
   * Record an immutable audit event.
   * Call this from controllers whenever a state-changing action occurs.
   */
  async log(entry: {
    orgId: string;
    actorId: string;
    actorName: string;
    action: string;
    targetType: string;
    targetId: string;
    targetName?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.repo.append(entry);
  }

  /** Return all logs for the requesting org, newest first. */
  async listByOrg(orgId: string) {
    return this.repo.listByOrg(orgId);
  }
 
  /** Return all logs across all orgs (Admin only). */
  async listAll() {
    return this.repo.listAll();
  }
}
