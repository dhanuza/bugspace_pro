import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { User } from "../types/index.js";
import admin, { adminAuth } from "../config/firebase.js";

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  /**
   * Verify a Firebase ID token and return the backend app user profile.
   * Firestore remains the source of truth for role, org, and account status.
   */
  async loginWithFirebaseToken(idToken: string): Promise<{ user: User }> {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const authProvider = decoded.firebase?.sign_in_provider === "google.com" ? "google" : "email";

    let user = await this.userRepo.getById(decoded.uid);

    if (!user && decoded.email) {
      const oldUser = await this.userRepo.getByEmail(decoded.email);
      if (oldUser) {
        user = await this.userRepo.create({
          ...oldUser,
          id: decoded.uid,
        });
        await this.userRepo.remove(oldUser.orgId, oldUser.id);
      }
    }

    const configDoc = await admin.firestore().collection("config").doc("admins").get();
    const allowedEmails: string[] = configDoc.data()?.allowed_emails || [];
    const isAdminEmail = decoded.email
      ? allowedEmails.some((email) => email.toLowerCase() === decoded.email?.toLowerCase())
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
          authProvider,
          lastLoginAt: new Date().toISOString(),
        } as any);
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
    } else if ((user.status === "inactive" || user.status === "invited") && user.role) {
      // Step 5: Pre-registered or invited user (has role but not yet active).
      // Update with Firebase UID and activate.
      const db = admin.firestore();
      if (user.id !== decoded.uid) {
        await db.collection("users").doc(user.id).delete(); // Remove placeholder/old record
        user = await this.userRepo.create({
          ...user,
          id: decoded.uid,
          name: decoded.name ?? user.name,
          status: "active",
          authProvider,
          lastLoginAt: new Date().toISOString(),
        } as any);
      } else {
        // Same UID — just activate in place
        await db.collection("users").doc(user.id).update({
          status: "active",
          authProvider,
          lastLoginAt: new Date().toISOString(),
          name: decoded.name ?? user.name,
        });
        user = { ...user, status: "active", authProvider, lastLoginAt: new Date().toISOString() } as any;
      }
    } else if ((!user.role || user.status === "inactive") && isAdminEmail) {
      // Step 6: Existing user with no role but is a known admin email → auto-upgrade
      user = (await this.userRepo.updateRole(user.orgId, user.id, "admin")) ?? user;
    } else if (user.status === "active") {
      // Step 7: Already active user — just update lastLoginAt
      const db = admin.firestore();
      await db.collection("users").doc(user.id).update({
        lastLoginAt: new Date().toISOString(),
        authProvider,
      });
      user = { ...user, lastLoginAt: new Date().toISOString(), authProvider } as any;
    }

    return { user: user as User };
  }

  async me(idToken: string): Promise<User | null> {
    try {
      const { user } = await this.loginWithFirebaseToken(idToken);
      return user;
    } catch (err) {
      console.error("[AuthService.me] Error:", err);
      return null;
    }
  }
}
