import type { IOrganizationRepository } from "../interfaces/IOrganizationRepository.js";
import type { Organization } from "../types/index.js";

// Optional local-dev seed organization.
const db: Organization[] = [
  {
    id: "org-1",
    name: "Bugspace Demo Org",
    domain: "bugspace.io",
    createdAt: new Date().toISOString(),
    createdBy: "u-admin",
  },
];

export class InMemoryOrganizationRepository implements IOrganizationRepository {
  async list() {
    return [...db];
  }

  async get(id: string) {
    return db.find((o) => o.id === id) ?? null;
  }

  async create(input: Omit<Organization, "id" | "createdAt">) {
    const org: Organization = {
      id: `org-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    db.push(org);
    return org;
  }
}
