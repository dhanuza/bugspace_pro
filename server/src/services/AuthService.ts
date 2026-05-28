import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { User } from "../types/index.js";
import admin, { adminAuth } from "../config/firebase.js";

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  /**
   * Verify a Firebase ID token and return (or seed) the matching app user.
   *
   * Flow:
   *  1. Verify the token with Firebase Admin SDK.
   *  2. Look up the user in our database by Firebase UID (or email as fallback).
   *  3. If the user doesn't exist yet, create a record (first-time login).
   *     - If the email is in the 'allowed_emails' list in Firestore → role: "admin", status: "active"
   *     - Otherwise → no role, status: "inactive" (needs admin approval)
   *  4. If the user exists but has no role and their email is in the list,
   *     auto-upgrade them to admin.
   *  5. Return the app user (with role + orgId).
   */
  async loginWithFirebaseToken(idToken: string): Promise<{ user: User }> {
    // Step 1: Verify the token.
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Step 2: Look up by Firebase UID first, then email fallback.
    let user = await this.userRepo.getById(decoded.uid);

    if (!user && decoded.email) {
      user = await this.userRepo.getByEmail(decoded.email);
    }

    // Step 3: Check if email is in the allowed admin list in Firestore
    const db = admin.firestore();
    const configDoc = await db.collection("config").doc("admins").get();
    const allowedEmails: string[] = configDoc.data()?.allowed_emails || [];

    const isAdminEmail = decoded.email
      ? allowedEmails.some(e => e.toLowerCase() === decoded.email?.toLowerCase())
      : false;

    if (!user && decoded.email) {
      // Step 3.5: If user doesn't exist by UID or Email, it might be a pre-registered user
      // with a placeholder ID. Check by email again to be absolutely sure.
      user = await this.userRepo.getByEmail(decoded.email);
    }

    if (!user) {
      // Step 4: First login — create a new user record.
      if (isAdminEmail) {
        // Known admin email → assign admin role immediately
        user = await this.userRepo.create({
          id: decoded.uid,
          name: decoded.name ?? decoded.email?.split("@")[0] ?? "Admin",
          email: decoded.email ?? "",
          role: "admin",
          orgId: "org-1",
          status: "active",
        });
      } else {
        // Regular user not in the DB and not an admin -> Return inactive placeholder
        // This allows them to stay authenticated but restricted to public/blog pages.
        user = {
          id: decoded.uid,
          name: decoded.name ?? decoded.email?.split("@")[0] ?? "Guest",
          email: decoded.email ?? "",
          role: "" as any,
          orgId: "none",
          status: "inactive",
          createdAt: new Date().toISOString(),
        };
      }
    } else if (user.status === "inactive" && user.role) {
      // Step 5: Pre-registered user (has role but inactive).
      // Update with Firebase UID and activate.
      const db = admin.firestore();
      await db.collection("users").doc(user.id).delete(); // Remove placeholder/old record
      user = await this.userRepo.create({
        ...user,
        id: decoded.uid,
        name: decoded.name ?? user.name,
        status: "active",
      });
    } else if ((!user.role || user.status === "inactive") && isAdminEmail) {
      // Step 6: Existing user with no role but is a known admin email → auto-upgrade
      user = (await this.userRepo.updateRole(user.orgId, user.id, "admin")) ?? user;
    }

    return { user: user as User };
  }

  /**
   * Demo login fallback — accepts a role string, returns a matching seed user.
   *
   * ⚠️  Only used when the Firebase Admin SDK is not configured (dev mode).
   * The frontend sends { role } in the body instead of { idToken }.
   */
  async loginDemo(role: string): Promise<{ user: User }> {
    const validRoles = ["admin", "manager", "researcher", "employee"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }
    const email = `${role}@bugspace.io`;
    const user = await this.userRepo.getByEmail(email);
    if (!user) throw new Error("Demo user not found for role: " + role);
    if (user.role !== "employee") {
      user.assignedPrograms = ["program-1"];
    }
    return { user };
  }

  /**
   * Return the app user for a verified Firebase token (used by GET /api/auth/me).
   */
  async me(idToken: string): Promise<User | null> {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      return this.userRepo.getById(decoded.uid);
    } catch {
      return null;
    }
  }
}
