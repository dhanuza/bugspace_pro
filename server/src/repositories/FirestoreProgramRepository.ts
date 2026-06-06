import type { IProgramRepository, ProgramListOptions } from "../interfaces/IProgramRepository.js";
import type { Program } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const programsCollection = db.collection("programs");

export class FirestoreProgramRepository implements IProgramRepository {
  private applyListOptions(query: FirebaseFirestore.Query, options?: ProgramListOptions) {
    let q = query;
    if (options?.status) q = q.where("status", "==", options.status);
    if (options?.cursor) q = q.startAfter(options.cursor);
    q = q.limit(Math.min(options?.limit ?? 50, 100));
    return q;
  }

  async list(orgId: string, options?: ProgramListOptions): Promise<Program[]> {
    try {
      const snapshot = await this.applyListOptions(
        programsCollection.where("orgId", "==", orgId),
        options
      ).get();
      const programs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Program));
      programs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return programs;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error listing programs:", error);
      throw error;
    }
  }

  async listAll(options?: ProgramListOptions): Promise<Program[]> {
    try {
      const snapshot = await this.applyListOptions(
        programsCollection,
        options
      ).get();
      const programs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Program));
      programs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return programs;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error listing all programs:", error);
      throw error;
    }
  }

  async get(orgId: string, id: string): Promise<Program | null> {
    try {
      const doc = await programsCollection.doc(id).get();
      if (!doc.exists) return null;
      const program = { id: doc.id, ...doc.data() } as Program;
      if (program.orgId !== orgId) return null;
      return program;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error getting program:", error);
      throw error;
    }
  }

  async create(
    orgId: string,
    input: Omit<Program, "id" | "createdAt" | "updatedAt" | "orgId">
  ): Promise<Program> {
    try {
      const now = new Date().toISOString();
      const programData = {
        ...input,
        orgId,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await programsCollection.add(programData);
      return { id: docRef.id, ...programData } as Program;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error creating program:", error);
      throw error;
    }
  }

  async update(
    orgId: string,
    id: string,
    input: Partial<Program>
  ): Promise<Program | null> {
    try {
      const docRef = programsCollection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const program = { id: doc.id, ...doc.data() } as Program;
      if (program.orgId !== orgId) return null;

      const updateData = {
        ...input,
        updatedAt: new Date().toISOString(),
      };
      await docRef.update(updateData);
      return { ...program, ...updateData } as Program;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error updating program:", error);
      throw error;
    }
  }

  async remove(orgId: string, id: string): Promise<boolean> {
    try {
      const docRef = programsCollection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return false;
      const program = { id: doc.id, ...doc.data() } as Program;
      if (program.orgId !== orgId) return false;

      await docRef.delete();
      return true;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error removing program:", error);
      throw error;
    }
  }

  async listByResearcher(orgId: string, researcherId: string, options?: ProgramListOptions): Promise<Program[]> {
    try {
      const snapshot = await this.applyListOptions(
        programsCollection
          .where("orgId", "==", orgId)
          .where("assignedResearchers", "array-contains", researcherId),
        options
      ).get();
      const programs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Program));
      programs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return programs;
    } catch (error) {
      console.error("[FirestoreProgramRepository] Error listing programs by researcher:", error);
      throw error;
    }
  }

  async count(orgId: string, status?: string): Promise<number> {
    let query: FirebaseFirestore.Query = programsCollection.where("orgId", "==", orgId);
    if (status) query = query.where("status", "==", status);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  async countByResearcher(orgId: string, researcherId: string, status?: string): Promise<number> {
    let query: FirebaseFirestore.Query = programsCollection
      .where("orgId", "==", orgId)
      .where("assignedResearchers", "array-contains", researcherId);
    if (status) query = query.where("status", "==", status);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }
}
