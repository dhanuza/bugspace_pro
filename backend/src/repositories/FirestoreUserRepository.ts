import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { User, Role } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const usersCollection = db.collection("users");

export class FirestoreUserRepository implements IUserRepository {
  async listByOrg(orgId: string): Promise<User[]> {
    try {
      const snapshot = await usersCollection.where("orgId", "==", orgId).get();
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Ensure role is included even if undefined
          role: data.role || null
        } as User;
      });
      console.log(`[FirestoreUserRepository] Found ${users.length} users for org ${orgId}`);
      return users;
    } catch (error) {
      console.error('[FirestoreUserRepository] Error listing users:', error);
      throw error;
    }
  }

  async listAll(): Promise<User[]> {
    try {
      const snapshot = await usersCollection.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      console.error('[FirestoreUserRepository] Error listing all users:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<User | null> {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  async getByEmail(email: string): Promise<User | null> {
    const snapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async updateRole(orgId: string, userId: string, role: Role): Promise<User | null> {
    const docRef = usersCollection.doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const user = { id: doc.id, ...doc.data() } as User;
    if (user.orgId !== orgId) return null;
    
    // When assigning a role, also set status to active (approve the user)
    await docRef.update({ 
      role,
      status: "active"
    });
    
    return { ...user, role, status: "active" };
  }

  async updateOrg(userId: string, orgId: string): Promise<User | null> {
    const docRef = usersCollection.doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update({ orgId });
    return { id: doc.id, ...doc.data(), orgId } as User;
  }

  async updateStatus(orgId: string, userId: string, status: "active" | "inactive"): Promise<User | null> {
    const docRef = usersCollection.doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const user = { id: doc.id, ...doc.data() } as User;
    if (user.orgId !== orgId) return null;
    await docRef.update({ status });
    return { ...user, status };
  }

  async remove(orgId: string, userId: string): Promise<boolean> {
    const docRef = usersCollection.doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    const user = { id: doc.id, ...doc.data() } as User;
    if (user.orgId !== orgId) return false;
    await docRef.delete();
    return true;
  }

  async create(input: Omit<User, "createdAt"> & { createdAt?: string }): Promise<User> {
    const user: any = {
      ...input,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    
    // Remove undefined role field if present
    if (user.role === undefined) {
      delete user.role;
    }
    
    // Use the provided ID or let Firestore generate one
    if (input.id) {
      await usersCollection.doc(input.id).set(user);
      return { ...user, id: input.id } as User;
    } else {
      const docRef = await usersCollection.add(user);
      return { ...user, id: docRef.id } as User;
    }
  }

  async bulkCreate(users: Array<Omit<User, "id" | "createdAt">>): Promise<void> {
    const batch = db.batch();
    const now = new Date().toISOString();

    users.forEach((userData) => {
      const docRef = usersCollection.doc(); // Auto-generated ID
      batch.set(docRef, {
        ...userData,
        createdAt: now,
        status: "inactive", // Status remains inactive until first login
      });
    });

    await batch.commit();
  }
}
