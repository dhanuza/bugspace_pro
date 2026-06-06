import type { IReportRepository } from "../interfaces/IReportRepository.js";
import type { Comment, Report, ReportStatus } from "../types/index.js";

const reports: Report[] = [
  {
    id: "R-1",
    title: "Stored XSS in Profile Bio",
    programId: "p-1",
    programName: "Enterprise Vulnerability Program",
    severity: "high",
    status: "Triaged",
    reporterId: "u-researcher",
    reporterName: "Riley Researcher",
    description: "A stored XSS vulnerability exists in the user profile bio field. Malicious JavaScript can be injected and executed when other users view the profile.",
    vulnerabilityType: "Cross-Site Scripting (XSS)",
    affectedAsset: "bugspace.io/profile",
    stepsToReproduce: "1. Navigate to /settings/profile\n2. In the Bio field, enter: <script>alert(document.cookie)</script>\n3. Save the profile\n4. Visit the profile page — the script executes",
    impact: "An attacker could steal session cookies, redirect users, or deface the application for any user viewing the infected profile.",
    proofOfConcept: "GET /api/users/123/profile HTTP/1.1\nHost: bugspace.io\n\nResponse contains unescaped <script> tag in bio field.",
    references: "https://owasp.org/www-community/attacks/xss/",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    orgId: "org-1",
  },
  {
    id: "R-2",
    title: "IDOR on Report Download Endpoint",
    programId: "p-1",
    programName: "Enterprise Vulnerability Program",
    severity: "critical",
    status: "New",
    reporterId: "u-researcher",
    reporterName: "Riley Researcher",
    description: "The /api/reports/:id/download endpoint does not validate report ownership, allowing any authenticated user to download reports belonging to other organizations.",
    vulnerabilityType: "Insecure Direct Object Reference (IDOR)",
    affectedAsset: "api.bugspace.io/reports",
    stepsToReproduce: "1. Authenticate as user in Org A\n2. GET /api/reports/R-999/download (belongs to Org B)\n3. Report PDF is returned without authorization check",
    impact: "Complete data breach — any authenticated user can access confidential vulnerability reports from any organization.",
    proofOfConcept: "curl -H 'Authorization: Bearer <token_org_a>' https://api.bugspace.io/reports/R-999/download\n\n200 OK — returns PDF belonging to Org B",
    references: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    orgId: "org-1",
  },
];

const comments: Comment[] = [
  {
    id: "c-1",
    reportId: "R-1",
    authorId: "u-manager",
    authorName: "Morgan Manager",
    body: "Thank you for the detailed report. We've confirmed the XSS vulnerability and have assigned it to the security team for remediation.",
    visibility: "researcher",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    orgId: "org-1",
  },
  {
    id: "c-2",
    reportId: "R-1",
    authorId: "u-researcher",
    authorName: "Riley Researcher",
    body: "Thanks for the quick triage. Let me know if you need additional PoC details or testing on the fix.",
    visibility: "researcher",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    orgId: "org-1",
  },
];

export class InMemoryReportRepository implements IReportRepository {
  async list(orgId: string) {
    return reports.filter((r) => r.orgId === orgId);
  }

  async listByReporter(orgId: string, reporterId: string) {
    return reports.filter((r) => r.orgId === orgId && r.reporterId === reporterId);
  }

  async get(orgId: string, id: string) {
    return reports.find((r) => r.id === id && r.orgId === orgId) ?? null;
  }

  async create(orgId: string, input: Partial<Report>, reporter: { id: string; name: string }) {
    const now = new Date().toISOString();
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
      vulnerabilityType: input.vulnerabilityType ?? "",
      affectedAsset: input.affectedAsset ?? "",
      stepsToReproduce: input.stepsToReproduce ?? "",
      impact: input.impact ?? "",
      proofOfConcept: input.proofOfConcept ?? "",
      references: input.references ?? "",
      createdAt: now,
      updatedAt: now,
      orgId,
    };
    reports.push(report);
    return report;
  }

  async updateStatus(orgId: string, id: string, status: ReportStatus) {
    const r = reports.find((x) => x.id === id && x.orgId === orgId);
    if (!r) return null;
    r.status = status;
    r.updatedAt = new Date().toISOString();
    return r;
  }

  async listComments(orgId: string, reportId: string) {
    const exists = reports.some((r) => r.id === reportId && r.orgId === orgId);
    if (!exists) return [];
    return comments.filter((c) => c.reportId === reportId);
  }

  async addComment(
    orgId: string,
    reportId: string,
    body: string,
    author: { id: string; name: string; role?: any },
    visibility: "internal" | "researcher" = "researcher"
  ) {
    const exists = reports.some((r) => r.id === reportId && r.orgId === orgId);
    if (!exists) throw new Error("Report not found");
    const comment: Comment = {
      id: `c-${Date.now()}`,
      reportId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      body,
      visibility,
      createdAt: new Date().toISOString(),
      orgId,
    };
    comments.push(comment);
    return comment;
  }

  async assignEmployee(orgId: string, reportId: string, employeeId: string, employeeName: string) {
    const r = reports.find((x) => x.id === reportId && x.orgId === orgId);
    if (!r) return null;
    (r as any).assignedEmployeeId = employeeId;
    (r as any).assignedEmployeeName = employeeName;
    r.updatedAt = new Date().toISOString();
    return { ...r };
  }

  async updateWorkflowStatus(orgId: string, reportId: string, workflowStatus: string) {
    const r = reports.find((x) => x.id === reportId && x.orgId === orgId);
    if (!r) return null;
    (r as any).workflowStatus = workflowStatus;
    r.updatedAt = new Date().toISOString();
    // Auto-sync report status
    if (workflowStatus === "Closed") r.status = "Closed";
    else if (workflowStatus === "Resolved") r.status = "Valid";
    return { ...r };
  }

  async count(orgId: string) {
    return reports.filter((r) => r.orgId === orgId).length;
  }

  async countByReporter(orgId: string, reporterId: string) {
    return reports.filter((r) => r.orgId === orgId && r.reporterId === reporterId).length;
  }
}
