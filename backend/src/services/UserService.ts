import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { IAuditLogRepository } from "../interfaces/IAuditLogRepository.js";
import type { Role, User } from "../types/index.js";

export class UserService {
  constructor(
    private repo: IUserRepository,
    private auditRepo: IAuditLogRepository
  ) {}

  listByOrg(orgId: string) {
    return this.repo.listByOrg(orgId);
  }

  listAll() {
    return this.repo.listAll();
  }

  getById(id: string) {
    return this.repo.getById(id);
  }

  async updateOrg(userId: string, orgId: string) {
    return this.repo.updateOrg(userId, orgId);
  }

  /**
   * Update a user's role within the same org.
   * Business rule: an admin cannot change their own role (prevents accidental self-lockout).
   */
  async updateRole(orgId: string, targetUserId: string, role: Role, requesterId: string) {
    if (targetUserId === requesterId) {
      throw new Error("You cannot change your own role.");
    }
    return this.repo.updateRole(orgId, targetUserId, role);
  }

  /**
   * Enable or disable a user account.
   * Business rule: admin cannot deactivate themselves.
   */
  async updateStatus(orgId: string, targetUserId: string, status: "active" | "inactive", requesterId: string) {
    if (targetUserId === requesterId) {
      throw new Error("You cannot change your own account status.");
    }
    return this.repo.updateStatus(orgId, targetUserId, status);
  }

  /**
   * Permanently remove a user from the org.
   * Business rule: admin cannot delete themselves.
   */
  async remove(orgId: string, targetUserId: string, requesterId: string) {
    if (targetUserId === requesterId) {
      throw new Error("You cannot delete your own account.");
    }
    return this.repo.remove(orgId, targetUserId);
  }

  /**
   * Admin-only: pre-register a single user.
   */
  async create(orgId: string, userData: { name: string; email: string; role: Role }, requesterId: string) {
    const user = await this.repo.create({
      ...userData,
      orgId,
      status: "inactive",
    });

    await this.auditRepo.append({
      orgId,
      actorId: requesterId,
      actorName: requesterId,
      action: "USER_INVITED",
      targetType: "user",
      targetId: user.id,
      targetName: user.name,
      metadata: { role: userData.role },
    });

    return user;
  }

  /**
   * Admin-only: pre-register multiple users via bulk upload.
   */
  async bulkCreate(orgId: string, users: Array<{ name: string; email: string; role: Role }>, requesterId: string) {
    const usersToCreate = users.map(u => ({
      ...u,
      orgId,
      status: "inactive" as const,
    }));

    await this.repo.bulkCreate(usersToCreate);

    await this.auditRepo.append({
      orgId,
      actorId: requesterId,
      actorName: requesterId,
      action: "USERS_BULK_UPLOADED",
      targetType: "user",
      targetId: "multiple",
      metadata: { count: users.length },
    });
  }
}
