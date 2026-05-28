import { api } from "../services/api";
import type { IUserRepository } from "./interfaces";
import type { User, Role } from "../types";

export class ApiUserRepository implements IUserRepository {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users");
    return data;
  }

  async get(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}/role`, { role });
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async getPending(): Promise<User[]> {
    const users = await this.list();
    // Filter users without assigned roles or with pending status
    return users.filter(user => !user.role || user.status === 'inactive');
  }

  async create(userData: { name: string; email: string; role: Role }): Promise<User> {
    const { data } = await api.post<User>("/users", userData);
    return data;
  }

  async bulkCreate(users: Array<{ name: string; email: string; role: Role }>): Promise<void> {
    await api.post("/users/bulk", { users });
  }
}

export const userRepository = new ApiUserRepository();
