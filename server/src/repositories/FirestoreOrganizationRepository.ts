import type { IOrganizationRepository } from "../interfaces/IOrganizationRepository.js";
import type { Organization } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const orgsCollection = db.collection("organizations");

export class FirestoreOrganizationRepository implements IOrganizationRepository {
  async list(): Promise<Organization[]> {
    const snapshot = await orgsCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Organization));
  }

  async getById(id: string): Promise<Organization | null> {
    const doc = await orgsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Organization;
  }

  async get(id: string): Promise<Organization | null> {
    return this.getById(id);
  }

  async create(input: Omit<Organization, "id">): Promise<Organization> {
    const docRef = await orgsCollection.add(input);
    return { id: docRef.id, ...input };
  }

  async update(id: string, input: Partial<Organization>): Promise<Organization | null> {
    const docRef = orgsCollection.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    await docRef.update(input);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as Organization;
  }

  async delete(id: string): Promise<void> {
    await orgsCollection.doc(id).delete();
  }
}
