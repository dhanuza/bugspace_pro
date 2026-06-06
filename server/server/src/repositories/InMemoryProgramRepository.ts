import type { IProgramRepository, ProgramListOptions } from "../interfaces/IProgramRepository.js";
import type { Program } from "../types/index.js";

const db: Program[] = [
  {
    id: "p-1",
    orgId: "org-1",
    name: "Enterprise Vulnerability Program",
    description: "Scope includes all main customer-facing API endpoints and web client applications.",
    scopeSummary: "api.bugspace.io, bugspace.io web client",
    scopes: [
      {
        assetName: "api.bugspace.io",
        type: "API",
        coverage: "in-scope",
        maxSeverity: "critical",
        notes: "Requires authentication token for all API endpoints."
      },
      {
        assetName: "bugspace.io",
        type: "Domain",
        coverage: "in-scope",
        maxSeverity: "high",
        notes: "SPA React application."
      }
    ],
    assignedResearchers: ["u-researcher"],
    assignedEmployees: ["u-employee"],
    testingGuidelines: "Please run scans out of business hours. Do not attempt Denial of Service (DoS) attacks.",
    managerId: "u-manager",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export class InMemoryProgramRepository implements IProgramRepository {
  async list(orgId: string, options?: ProgramListOptions) {
    let result = db.filter((p) => p.orgId === orgId);
    if (options?.status) {
      result = result.filter((p) => p.status === options.status);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return result;
  }

  async listAll(options?: ProgramListOptions) {
    let result = [...db];
    if (options?.status) {
      result = result.filter((p) => p.status === options.status);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return result;
  }

  async get(orgId: string, id: string) {
    return db.find((p) => p.id === id && p.orgId === orgId) ?? null;
  }

  async create(orgId: string, input: Omit<Program, "id" | "createdAt" | "updatedAt" | "orgId">) {
    const now = new Date().toISOString();
    const program: Program = {
      ...input,
      id: `p-${Date.now()}`,
      orgId,
      createdAt: now,
      updatedAt: now,
    };
    db.push(program);
    return program;
  }

  async update(orgId: string, id: string, input: Partial<Program>) {
    const idx = db.findIndex((p) => p.id === id && p.orgId === orgId);
    if (idx === -1) return null;
    db[idx] = { ...db[idx], ...input, updatedAt: new Date().toISOString() };
    return db[idx];
  }

  async remove(orgId: string, id: string) {
    const idx = db.findIndex((p) => p.id === id && p.orgId === orgId);
    if (idx === -1) return false;
    db.splice(idx, 1);
    return true;
  }

  async listByResearcher(orgId: string, researcherId: string, options?: ProgramListOptions) {
    let result = db.filter(
      (p) => p.orgId === orgId && p.assignedResearchers.includes(researcherId)
    );
    if (options?.status) {
      result = result.filter((p) => p.status === options.status);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return result;
  }

  async count(orgId: string, status?: string) {
    return db.filter((p) => p.orgId === orgId && (!status || p.status === status)).length;
  }

  async countByResearcher(orgId: string, researcherId: string, status?: string) {
    return db.filter(
      (p) => p.orgId === orgId && p.assignedResearchers.includes(researcherId) && (!status || p.status === status)
    ).length;
  }
}
