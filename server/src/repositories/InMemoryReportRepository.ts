import type { IReportRepository } from "../interfaces/IReportRepository.js";
import type { Comment, Report, ReportStatus } from "../types/index.js";

const reports: Report[] = [];
const comments: Comment[] = [];

export class InMemoryReportRepository implements IReportRepository {
  async list(orgId: string) {
    return [
      {
        id: "R-101",
        title: "Stored XSS in profile",
        programId: "p1",
        programName: "Web App",
        severity: "high",
        status: "New",
        reporterId: "u1",
        reporterName: "Tester",
        description: "Demo report",
        createdAt: new Date().toISOString(),
        orgId: "org-1",
  },
      {
        id: "R-102",
        title: "IDOR in invoices API",
        programId: "p2",
        programName: "Mobile API",
        severity: "critical",
        status: "Triaged",
        reporterId: "u2",
        reporterName: "Researcher",
        description: "Sensitive data exposure",
        createdAt: new Date().toISOString(),
        orgId: "org-1",
      },
    ];
}
  async get(orgId: string, id: string) {
    return reports.find((r) => r.id === id && r.orgId === orgId) ?? null;
  }
  async create(orgId: string, input: Partial<Report>, reporter: { id: string; name: string }) {
    const report: Report = {
      id: `R-${Date.now()}`,
      title: input.title ?? "Untitled",
      programId: input.programId ?? "",
      programName: input.programName ?? "",
      severity: input.severity ?? "medium",
      status: "New",
      reporterId: reporter.id,
      reporterName: reporter.name,
      description: input.description ?? "",
      createdAt: new Date().toISOString(),
      orgId,
    };
    reports.push(report);
    return report;
  }
  async updateStatus(orgId: string, id: string, status: ReportStatus) {
    const r = reports.find((x) => x.id === id && x.orgId === orgId);
    if (!r) return null;
    r.status = status;
    return r;
  }
  async listComments(orgId: string, reportId: string) {
    const exists = reports.some((r) => r.id === reportId && r.orgId === orgId);
    if (!exists) return [];
    return comments.filter((c) => c.reportId === reportId);
  }
  async addComment(orgId: string, reportId: string, body: string, author: { id: string; name: string }) {
    const exists = reports.some((r) => r.id === reportId && r.orgId === orgId);
    if (!exists) throw new Error("Report not found");
    const comment: Comment = {
      id: `c-${Date.now()}`,
      reportId,
      authorId: author.id,
      authorName: author.name,
      body,
      createdAt: new Date().toISOString(),
      orgId,
    };
    comments.push(comment);
    return comment;
  }
}
