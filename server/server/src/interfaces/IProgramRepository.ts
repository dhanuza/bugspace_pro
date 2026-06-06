import type { Program } from "../types/index.js";

export interface ProgramListOptions {
  status?: string;
  limit?: number;
  cursor?: string;
}

export interface IProgramRepository {
  list(orgId: string, options?: ProgramListOptions): Promise<Program[]>;
  listAll(options?: ProgramListOptions): Promise<Program[]>;
  get(orgId: string, id: string): Promise<Program | null>;
  create(orgId: string, input: Omit<Program, "id" | "createdAt" | "updatedAt" | "orgId">): Promise<Program>;
  update(orgId: string, id: string, input: Partial<Program>): Promise<Program | null>;
  remove(orgId: string, id: string): Promise<boolean>;
  listByResearcher(orgId: string, researcherId: string, options?: ProgramListOptions): Promise<Program[]>;
  count(orgId: string, status?: string): Promise<number>;
  countByResearcher(orgId: string, researcherId: string, status?: string): Promise<number>;
}
