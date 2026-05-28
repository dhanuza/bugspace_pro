import type { IAuditLogRepository } from "../interfaces/IAuditLogRepository.js";
import type { AuditLog } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const auditLogsCollection = db.collection("audit_logs");

export class FirestoreAuditLogRepository implements IAuditLogRepository {
  async listByOrg(orgId: string): Promise<AuditLog[]> {
    const snapshot = await auditLogsCollection
      .where("orgId", "==", orgId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
  }
 
  async listAll(): Promise<AuditLog[]> {
    const snapshot = await auditLogsCollection
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog));
  }

  async append(entry: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const now = new Date().toISOString();
    const data = { ...entry, createdAt: now };
    const docRef = await auditLogsCollection.add(data);
    return { id: docRef.id, ...data };
  }
}
