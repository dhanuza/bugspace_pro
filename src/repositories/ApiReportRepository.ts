import { api } from "../services/api";
import type { Report, Comment } from "../types";
import type { IReportRepository } from "./interfaces";

export class ApiReportRepository implements IReportRepository {
  async list() {
    const { data } = await api.get<Report[]>("/reports");
    return data;
  }
  async get(id: string) {
    const { data } = await api.get<Report>(`/reports/${id}`);
    return data;
  }
  async create(input: Partial<Report>) {
    const { data } = await api.post<Report>("/reports", input);
    return data;
  }
  async updateStatus(id: string, status: Report["status"]) {
    const { data } = await api.patch<Report>(`/reports/${id}/status`, { status });
    return data;
  }
  async comments(id: string) {
    const { data } = await api.get<Comment[]>(`/reports/${id}/comments`);
    return data;
  }
  async addComment(id: string, body: string) {
    const { data } = await api.post<Comment>(`/reports/${id}/comments`, { body });
    return data;
  }
}

export const reportRepository = new ApiReportRepository();
