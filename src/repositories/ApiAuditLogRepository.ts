import { api } from "../services/api";
import type { IAuditLogRepository } from "./interfaces";
import type { AuditLog } from "../types";

export class ApiAuditLogRepository implements IAuditLogRepository {
  async list(): Promise<AuditLog[]> {
    const { data } = await api.get<AuditLog[]>("/audit-logs");
    return data;
  }

  async get(id: string): Promise<AuditLog> {
    const { data } = await api.get<AuditLog>(`/audit-logs/${id}`);
    return data;
  }
}

export const auditLogRepository = new ApiAuditLogRepository();
