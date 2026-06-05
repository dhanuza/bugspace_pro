import type { User, Role } from "../types/index.js";

export interface IUserRepository {
  listByOrg(orgId: string): Promise<User[]>;
  listAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  updateRole(orgId: string, userId: string, role: Role): Promise<User | null>;
  updateOrg(userId: string, orgId: string): Promise<User | null>;
  updateStatus(orgId: string, userId: string, status: "active" | "inactive"): Promise<User | null>;
  remove(orgId: string, userId: string): Promise<boolean>;
  /** id is optional — when provided (e.g., Firebase UID) it overrides the generated id. */
  create(input: Omit<User, "id" | "createdAt"> & { id?: string }): Promise<User>;
  bulkCreate(users: Array<Omit<User, "id" | "createdAt">>): Promise<void>;
}
