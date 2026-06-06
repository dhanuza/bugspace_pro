import type { IAuditLogRepository } from "../interfaces/IAuditLogRepository.js";
import type { AuditLog } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const auditLogsCollection = db.collection("audit_logs");

export class FirestoreAuditLogRepository implements IAuditLogRepository {
  async listByOrg(orgId: string, options?: { limit?: number; cursor?: string }): Promise<AuditLog[]> {
    let query = auditLogsCollection
      .where("orgId", "==", orgId);
    if (options?.cursor) query = query.startAfter(options.cursor);
    query = query.limit(Math.min(options?.limit ?? 50, 100));
    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
    logs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return logs;
  }
 
  async listAll(): Promise<AuditLog[]> {
    const snapshot = await auditLogsCollection.get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
    logs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return logs;
  }

  async append(entry: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const now = new Date().toISOString();
    const data = { ...entry, createdAt: now };
    const docRef = await auditLogsCollection.add(data);
    return { id: docRef.id, ...data };
  }
}
