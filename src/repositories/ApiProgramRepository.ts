import { api } from "../services/api";
import type { Program } from "../types";
import type { IProgramRepository } from "./interfaces";

export class ApiProgramRepository implements IProgramRepository {
  async list() {
    const { data } = await api.get<Program[]>("/programs");
    return data;
  }
  async get(id: string) {
    const { data } = await api.get<Program>(`/programs/${id}`);
    return data;
  }
  async create(input: Partial<Program>) {
    const { data } = await api.post<Program>("/programs", input);
    return data;
  }
}

export const programRepository = new ApiProgramRepository();
