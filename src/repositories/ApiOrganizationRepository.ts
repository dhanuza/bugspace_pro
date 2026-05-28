import { api } from "../services/api";
import type { IOrganizationRepository } from "./interfaces";
import type { Organization } from "../types";

export class ApiOrganizationRepository implements IOrganizationRepository {
  async list(): Promise<Organization[]> {
    const { data } = await api.get<Organization[]>("/organizations");
    return data;
  }

  async get(id: string): Promise<Organization> {
    const { data } = await api.get<Organization>(`/organizations/${id}`);
    return data;
  }

  async create(input: Partial<Organization>): Promise<Organization> {
    const { data } = await api.post<Organization>("/organizations", input);
    return data;
  }

  async update(id: string, input: Partial<Organization>): Promise<Organization> {
    const { data } = await api.patch<Organization>(`/organizations/${id}`, input);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  }
}

export const organizationRepository = new ApiOrganizationRepository();
