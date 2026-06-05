import type { IReportRepository } from "../interfaces/IReportRepository.js";
import type { AuthUser, ReportStatus } from "../types/index.js";

export class ReportService {
  constructor(private repo: IReportRepository) {}
  async list(orgId: string, user: AuthUser) {
    const reports = await this.repo.list(orgId);

  // Admin and manager can see all reports
    if (user.role === "admin" || user.role === "manager") {
      return reports;
  }

  // Employee sees only assigned programs
    if (user.role === "employee") {
      return reports.filter((report) =>
    user.assignedPrograms?.includes(report.programId)
    );
  }

  return [];
}
  get(orgId: string, id: string) { return this.repo.get(orgId, id); }
  create(orgId: string, input: any, reporter: { id: string; name: string }) {
    return this.repo.create(orgId, input, reporter);
  }
  updateStatus(orgId: string, id: string, status: ReportStatus) {
    return this.repo.updateStatus(orgId, id, status);
  }
  comments(orgId: string, reportId: string) { return this.repo.listComments(orgId, reportId); }
  addComment(orgId: string, reportId: string, body: string, author: { id: string; name: string }) {
    return this.repo.addComment(orgId, reportId, body, author);
  }
}
