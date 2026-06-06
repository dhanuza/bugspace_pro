import type { Report, Comment, ReportStatus } from "../types/index.js";

export interface ReportListOptions {
  status?: ReportStatus;
  programId?: string;
  limit?: number;
  cursor?: string;
}

export interface IReportRepository {
  list(orgId: string, options?: ReportListOptions): Promise<Report[]>;
  listByReporter(orgId: string, reporterId: string, options?: ReportListOptions): Promise<Report[]>;
  get(orgId: string, id: string): Promise<Report | null>;
  create(orgId: string, input: Partial<Report>, reporter: { id: string; name: string }): Promise<Report>;
  updateStatus(orgId: string, id: string, status: ReportStatus): Promise<Report | null>;
  assignEmployee(orgId: string, reportId: string, employeeId: string, employeeName: string): Promise<Report | null>;
  updateWorkflowStatus(orgId: string, reportId: string, workflowStatus: string): Promise<Report | null>;
  count(orgId: string, filters?: Pick<ReportListOptions, "status" | "programId">): Promise<number>;
  countByReporter(orgId: string, reporterId: string, filters?: Pick<ReportListOptions, "status" | "programId">): Promise<number>;
  listComments(orgId: string, reportId: string): Promise<Comment[]>;
  addComment(
    orgId: string,
    reportId: string,
    body: string,
    author: { id: string; name: string; role: Comment["authorRole"] },
    visibility: Comment["visibility"]
  ): Promise<Comment>;
}

