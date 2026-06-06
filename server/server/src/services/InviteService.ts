import crypto from "crypto";
import type { FirestoreInviteRepository } from "../repositories/FirestoreInviteRepository.js";
import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { IAuditLogRepository } from "../interfaces/IAuditLogRepository.js";
import type { Role, Invite } from "../types/index.js";
import { emailService } from "./EmailService.js";

const INVITE_EXPIRY_HOURS = 24;

/**
 * Generate a cryptographically secure token (32 bytes → 64 hex chars).
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export class InviteService {
  constructor(
    private inviteRepo: FirestoreInviteRepository,
    private userRepo: IUserRepository,
    private auditRepo: IAuditLogRepository,
  ) {}

  /**
   * Create an invite + pre-register the user as "invited".
   * Sends an email with the invite link.
   */
  async createInvite(
    orgId: string,
    data: { name: string; email: string; role: Role },
    requesterId: string,
    frontendUrl: string,
  ): Promise<Invite> {
    const email = data.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await this.userRepo.getByEmail(email);
    if (existing && existing.status === "active") {
      throw new Error("A user with this email is already active on the platform.");
    }

    // Check if there's already a pending invite
    const existingInvites = await this.inviteRepo.getByEmail(email);
    if (existingInvites.length > 0) {
      throw new Error("An invite has already been sent to this email. Use 'Resend Invite' instead.");
    }

    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create the invite record
    const invite = await this.inviteRepo.create({
      email,
      name: data.name,
      role: data.role,
      orgId,
      token,
      status: "pending",
      createdBy: requesterId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    // Create or update user record as "invited"
    if (existing) {
      // Update existing inactive user
      await this.userRepo.updateStatus(orgId, existing.id, "invited" as any);
    } else {
      // Create new user with "invited" status
      await this.userRepo.create({
        name: data.name,
        email,
        role: data.role,
        orgId,
        status: "invited" as any,
        inviteSentAt: now.toISOString(),
      } as any);
    }

    // Send invite email
    const inviteUrl = `${frontendUrl}/invite/${token}`;
    await emailService.sendInviteEmail({
      to: email,
      name: data.name,
      role: data.role,
      inviteUrl,
    });

    // Audit log
    await this.auditRepo.append({
      orgId,
      actorId: requesterId,
      actorName: requesterId,
      action: "INVITE_SENT",
      targetType: "user",
      targetId: invite.id,
      targetName: data.name,
      metadata: { email, role: data.role },
    });

    return invite;
  }

  /**
   * Create invites in bulk (from CSV upload).
   */
  async bulkInvite(
    orgId: string,
    users: Array<{ name: string; email: string; role: Role }>,
    requesterId: string,
    frontendUrl: string,
  ): Promise<{ sent: number; skipped: number; errors: string[] }> {
    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const userData of users) {
      try {
        await this.createInvite(orgId, userData, requesterId, frontendUrl);
        sent++;
      } catch (err: any) {
        if (err.message.includes("already")) {
          skipped++;
        } else {
          errors.push(`${userData.email}: ${err.message}`);
        }
      }
    }

    // Audit log
    await this.auditRepo.append({
      orgId,
      actorId: requesterId,
      actorName: requesterId,
      action: "BULK_INVITES_SENT",
      targetType: "user",
      targetId: "multiple",
      metadata: { total: users.length, sent, skipped, errorCount: errors.length },
    });

    return { sent, skipped, errors };
  }

  /**
   * Validate an invite token — returns invite data if valid.
   */
  async validateToken(token: string): Promise<{ valid: boolean; invite?: Invite; error?: string }> {
    const invite = await this.inviteRepo.getByToken(token);

    if (!invite) {
      return { valid: false, error: "Invalid invite link." };
    }

    if (invite.status === "used") {
      return { valid: false, error: "This invite has already been used." };
    }

    if (invite.status === "revoked") {
      return { valid: false, error: "This invite has been revoked." };
    }

    if (new Date(invite.expiresAt) < new Date()) {
      // Auto-expire
      await this.inviteRepo.revoke(invite.id);
      return { valid: false, error: "This invite has expired. Please contact your administrator." };
    }

    return { valid: true, invite };
  }

  /**
   * Accept an invite — called after Firebase auth verifies the user.
   * Validates that the login email matches the invited email.
   */
  async acceptInvite(
    token: string,
    firebaseUid: string,
    firebaseEmail: string,
    authProvider: string,
  ): Promise<{ success: boolean; error?: string }> {
    const validation = await this.validateToken(token);
    if (!validation.valid || !validation.invite) {
      return { success: false, error: validation.error };
    }

    const invite = validation.invite;

    // SECURITY: Email must match
    if (invite.email.toLowerCase() !== firebaseEmail.toLowerCase()) {
      return {
        success: false,
        error: "The email you signed in with does not match the invited email address.",
      };
    }

    // Mark invite as used
    await this.inviteRepo.markUsed(invite.id, firebaseUid);

    // Find or update the user record
    const existingUser = await this.userRepo.getByEmail(invite.email);
    if (existingUser) {
      // Update the user: set Firebase UID, activate, record auth provider
      const db = (await import("../config/firebase.js")).default.firestore();
      const userDoc = db.collection("users").doc(existingUser.id);

      // If the user was pre-created with a Firestore-generated ID, delete and re-create with Firebase UID
      if (existingUser.id !== firebaseUid) {
        await userDoc.delete();
        await this.userRepo.create({
          id: firebaseUid,
          name: existingUser.name || invite.name,
          email: invite.email,
          role: invite.role,
          orgId: invite.orgId,
          status: "active",
          authProvider,
          lastLoginAt: new Date().toISOString(),
          inviteSentAt: existingUser.inviteSentAt,
        } as any);
      } else {
        await userDoc.update({
          status: "active",
          authProvider,
          lastLoginAt: new Date().toISOString(),
        });
      }
    } else {
      // Create new user (shouldn't normally happen, but safe fallback)
      await this.userRepo.create({
        id: firebaseUid,
        name: invite.name,
        email: invite.email,
        role: invite.role,
        orgId: invite.orgId,
        status: "active",
        authProvider,
        lastLoginAt: new Date().toISOString(),
      } as any);
    }

    // Audit log
    await this.auditRepo.append({
      orgId: invite.orgId,
      actorId: firebaseUid,
      actorName: invite.name,
      action: "INVITE_ACCEPTED",
      targetType: "user",
      targetId: firebaseUid,
      metadata: { authProvider, role: invite.role },
    });

    return { success: true };
  }

  /**
   * Resend an invite — generates a new token and re-sends the email.
   */
  async resendInvite(
    inviteId: string,
    requesterId: string,
    frontendUrl: string,
  ): Promise<Invite> {
    const invite = await this.inviteRepo.getByToken(""); // We need getById — let's use the collection directly
    // Actually, let's find by iterating org invites
    const db = (await import("../config/firebase.js")).default.firestore();
    const doc = await db.collection("invites").doc(inviteId).get();

    if (!doc.exists) {
      throw new Error("Invite not found.");
    }

    const inviteData = { id: doc.id, ...doc.data() } as Invite;

    if (inviteData.status === "used") {
      throw new Error("This invite has already been used.");
    }

    const newToken = generateToken();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    await this.inviteRepo.updateToken(inviteId, newToken, expiresAt);

    // Update user's inviteSentAt
    const user = await this.userRepo.getByEmail(inviteData.email);
    if (user) {
      const userDoc = db.collection("users").doc(user.id);
      await userDoc.update({ inviteSentAt: new Date().toISOString() });
    }

    // Re-send email
    const inviteUrl = `${frontendUrl}/invite/${newToken}`;
    await emailService.sendInviteEmail({
      to: inviteData.email,
      name: inviteData.name,
      role: inviteData.role,
      inviteUrl,
    });

    // Audit
    await this.auditRepo.append({
      orgId: inviteData.orgId,
      actorId: requesterId,
      actorName: requesterId,
      action: "INVITE_RESENT",
      targetType: "user",
      targetId: inviteId,
      targetName: inviteData.name,
      metadata: { email: inviteData.email },
    });

    return { ...inviteData, token: newToken, expiresAt, status: "pending" };
  }

  /**
   * Get invite link for copying.
   */
  getInviteUrl(token: string, frontendUrl: string): string {
    return `${frontendUrl}/invite/${token}`;
  }
}
