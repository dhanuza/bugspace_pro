import type { Program, Report, Comment, User, Organization, AuditLog, Role } from "../types";

export interface IAuthRepository {
  login(idToken: string): Promise<{ user: User }>;
  me(): Promise<{ user: User }>;
}

export interface IUserRepository {
  list(): Promise<User[]>;
  get(id: string): Promise<User>;
  updateRole(id: string, role: Role): Promise<User>;
  delete(id: string): Promise<void>;
  getPending(): Promise<User[]>;
  create(userData: { name: string; email: string; role: Role }): Promise<User>;
  bulkCreate(users: Array<{ name: string; email: string; role: Role }>): Promise<void>;
}

export interface IOrganizationRepository {
  list(): Promise<Organization[]>;
  get(id: string): Promise<Organization>;
  create(input: Partial<Organization>): Promise<Organization>;
  update(id: string, input: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;
}

export interface IAuditLogRepository {
  list(): Promise<AuditLog[]>;
  get(id: string): Promise<AuditLog>;
}

export interface IProgramRepository {
  list(): Promise<Program[]>;
  get(id: string): Promise<Program>;
  create(input: Partial<Program>): Promise<Program>;
}

export interface IReportRepository {
  list(): Promise<Report[]>;
  get(id: string): Promise<Report>;
  create(input: Partial<Report>): Promise<Report>;
  updateStatus(id: string, status: Report["status"]): Promise<Report>;
  comments(id: string): Promise<Comment[]>;
  addComment(id: string, body: string): Promise<Comment>;
}
