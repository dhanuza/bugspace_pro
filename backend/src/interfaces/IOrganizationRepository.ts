import type { Organization } from "../types/index.js";

export interface IOrganizationRepository {
  list(): Promise<Organization[]>;
  get(id: string): Promise<Organization | null>;
  create(input: Omit<Organization, "id" | "createdAt">): Promise<Organization>;
}
