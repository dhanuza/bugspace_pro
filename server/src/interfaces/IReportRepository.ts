import type { Report, Comment, ReportStatus } from "../types/index.js";

export interface IReportRepository {
  list(orgId: string): Promise<Report[]>;
  get(orgId: string, id: string): Promise<Report | null>;
  create(orgId: string, input: Partial<Report>, reporter: { id: string; name: string }): Promise<Report>;
  updateStatus(orgId: string, id: string, status: ReportStatus): Promise<Report | null>;
  listComments(orgId: string, reportId: string): Promise<Comment[]>;
  addComment(orgId: string, reportId: string, body: string, author: { id: string; name: string }): Promise<Comment>;
}
