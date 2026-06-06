import type { Invite } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const invitesCollection = db.collection("invites");

export class FirestoreInviteRepository {
  /**
   * Create a new invite document.
   */
  async create(invite: Omit<Invite, "id">): Promise<Invite> {
    const docRef = await invitesCollection.add({
      ...invite,
      createdAt: invite.createdAt ?? new Date().toISOString(),
    });
    return { id: docRef.id, ...invite } as Invite;
  }

  /**
   * Find an invite by its secure token.
   */
  async getByToken(token: string): Promise<Invite | null> {
    const snapshot = await invitesCollection.where("token", "==", token).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invite;
  }

  /**
   * Find all pending invites for a given email.
   */
  async getByEmail(email: string): Promise<Invite[]> {
    const snapshot = await invitesCollection
      .where("email", "==", email.toLowerCase())
      .where("status", "==", "pending")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Invite));
  }

  /**
   * Find all invites for a given org (admin view).
   */
  async listByOrg(orgId: string): Promise<Invite[]> {
    const snapshot = await invitesCollection.where("orgId", "==", orgId).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Invite));
  }

  /**
   * Mark an invite as used.
   */
  async markUsed(inviteId: string, usedBy: string): Promise<void> {
    await invitesCollection.doc(inviteId).update({
      status: "used",
      usedAt: new Date().toISOString(),
      usedBy,
    });
  }

  /**
   * Revoke an invite (admin action).
   */
  async revoke(inviteId: string): Promise<void> {
    await invitesCollection.doc(inviteId).update({
      status: "revoked",
    });
  }

  /**
   * Update invite token and expiry (for resend).
   */
  async updateToken(inviteId: string, token: string, expiresAt: string): Promise<void> {
    await invitesCollection.doc(inviteId).update({
      token,
      expiresAt,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Delete an invite document entirely.
   */
  async remove(inviteId: string): Promise<boolean> {
    const doc = await invitesCollection.doc(inviteId).get();
    if (!doc.exists) return false;
    await invitesCollection.doc(inviteId).delete();
    return true;
  }
}
