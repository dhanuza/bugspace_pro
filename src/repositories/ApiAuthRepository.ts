import { api } from "../services/api";
import type { IAuthRepository } from "./interfaces";
import type { User } from "../types";

export class ApiAuthRepository implements IAuthRepository {
  async login(idToken: string): Promise<{ user: User }> {
    const { data } = await api.post<{ user: User }>("/auth/login", { idToken });
    return data;
  }

  async me(): Promise<{ user: User }> {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data;
  }
}

export const authRepository = new ApiAuthRepository();
