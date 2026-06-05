import type { Program } from "../types/index.js";

export interface IProgramRepository {
  list(orgId: string): Promise<Program[]>;
  listAll(): Promise<Program[]>;
  get(orgId: string, id: string): Promise<Program | null>;
  create(orgId: string, input: Partial<Program>): Promise<Program>;
}
