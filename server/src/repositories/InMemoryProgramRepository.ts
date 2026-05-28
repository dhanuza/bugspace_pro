import type { IProgramRepository } from "../interfaces/IProgramRepository.js";
import type { Program } from "../types/index.js";

// Placeholder DB - replace with Firestore implementation.
const db: Program[] = [];

export class InMemoryProgramRepository implements IProgramRepository {
  async list(orgId: string) {
    return db.filter((p) => p.orgId === orgId);
  }
  async listAll() {
    return [...db];
  }
  async get(orgId: string, id: string) {
    return db.find((p) => p.id === id && p.orgId === orgId) ?? null;
  }
  async create(orgId: string, input: Partial<Program>) {
    const program: Program = {
      id: `p-${Date.now()}`,
      name: input.name ?? "Untitled",
      scope: input.scope ?? "",
      active: input.active ?? true,
      orgId,
    };
    db.push(program);
    return program;
  }
}
