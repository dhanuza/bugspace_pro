import type { Request, Response } from "express";
import { ReportService } from "../services/ReportService.js";
import { reportRepo, programRepo, userRepo, auditLogRepo, notificationRepo } from "../repositories/index.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { NotificationService } from "../services/NotificationService.js";
import xss from "xss";

const service = new ReportService(reportRepo);
const auditService = new AuditLogService(auditLogRepo);
const notifService = new NotificationService(notificationRepo);

const VALID_SEVERITIES = ["low", "medium", "high", "critical", "informational"];
const VALID_STATUSES = ["New", "Needs Info", "Triaged", "Valid", "Duplicate", "Closed"];

export const ReportController = {
  /**
   * GET /api/reports
   * Researchers see only their own reports.
   * Managers/admins see all reports in the org.
   */
  list: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;

    let reports;
    const options = {
      status: typeof req.query.status === "string" ? req.query.status as any : undefined,
      programId: typeof req.query.programId === "string" ? req.query.programId : undefined,
      limit: Number(req.query.limit ?? 50),
      cursor: typeof req.query.cursor === "string" ? req.query.cursor : undefined,
    };
    if (user.role === "researcher") {
      reports = await reportRepo.listByReporter(orgId, user.id, options);
    } else if (user.role === "manager") {
      const allReports = await service.list(orgId, options);
      const allPrograms = await programRepo.list(orgId, { limit: 1000 });
      const myProgramIds = new Set(allPrograms.filter(p => p.managerId === user.id).map(p => p.id));
      reports = allReports.filter(r => myProgramIds.has(r.programId));
    } else {
      reports = await service.list(orgId, options);
    }

    return res.json({ reports, total: reports.length });
  },

  get: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const r = await service.get(orgId, req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });

    // Researchers can only see their own reports
    if (user.role === "researcher" && r.reporterId !== user.id) {
      return res.status(403).json({ error: "Not authorized to view this report." });
    }

    // Managers can only see reports for programs they created
    if (user.role === "manager") {
      const program = await programRepo.get(orgId, r.programId);
      if (!program || program.managerId !== user.id) {
        return res.status(403).json({ error: "Not authorized to view this report." });
      }
    }

    res.json(r);
  },

  /**
   * POST /api/reports
   * Creates a vulnerability report. Researcher must be assigned to the program.
   */
  create: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const {
      title, programId, severity, vulnerabilityType,
      affectedAsset, description, stepsToReproduce,
      impact, proofOfConcept, references,
    } = req.body;

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Report title is required." });
    }
    if (!programId) {
      return res.status(400).json({ error: "Program ID is required." });
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: `Severity must be one of: ${VALID_SEVERITIES.join(", ")}` });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Description is required." });
    }

    // Verify program exists and researcher is assigned
    const program = await programRepo.get(orgId, programId);
    if (!program) {
      return res.status(404).json({ error: "Program not found." });
    }
    if (user.role === "researcher" && !program.assignedResearchers.includes(user.id)) {
      return res.status(403).json({ error: "You are not assigned to this program." });
    }

    // Get reporter name
    const dbUser = await userRepo.getById(user.id);
    const reporterName = dbUser?.name || user.id;

    const reporter = { id: user.id, name: reporterName };
    const sanitizedInput = {
      title: xss(title.trim()),
      programId,
      programName: program.name,
      severity: severity || "medium",
      description: xss(description.trim()),
      vulnerabilityType: vulnerabilityType ? xss(vulnerabilityType) : "",
      affectedAsset: affectedAsset ? xss(affectedAsset.trim()) : "",
      stepsToReproduce: stepsToReproduce ? xss(stepsToReproduce.trim()) : "",
      impact: impact ? xss(impact.trim()) : "",
      proofOfConcept: proofOfConcept ? xss(proofOfConcept.trim()) : "",
      references: references ? xss(references.trim()) : "",
    };

    const report = await service.create(orgId, sanitizedInput, reporter);

    auditService.log({
      orgId,
      actorId: user.id,
      actorName: reporterName,
      action: "CREATE_REPORT",
      targetType: "report",
      targetId: report.id,
      targetName: report.title,
    }).catch(() => {});

    res.status(201).json(report);
  },

  updateStatus: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const { status } = req.body;
    const user = req.user!;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const existing = await service.get(orgId, req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (user.role === "manager") {
      const program = await programRepo.get(orgId, existing.programId);
      if (!program || program.managerId !== user.id) {
        return res.status(403).json({ error: "Not authorized to update status on this report." });
      }
    }

    const r = await service.updateStatus(orgId, req.params.id, status);
    if (!r) return res.status(404).json({ error: "Not found" });

    // Notify reporter of status change
    notifService.onStatusUpdated({
      orgId,
      reporterId: r.reporterId,
      reportId: r.id,
      reportTitle: r.title,
      newStatus: status,
    }).catch(() => {});

    // Extra notification if manager requests more info
    if (status === "Needs Info") {
      notifService.onNeedsInfo({
        orgId,
        reporterId: r.reporterId,
        reportId: r.id,
        reportTitle: r.title,
      }).catch(() => {});
    }

    auditService.log({
      orgId,
      actorId: req.user!.id,
      actorName: req.user!.id,
      action: "UPDATE_REPORT_STATUS",
      targetType: "report",
      targetId: r.id,
      targetName: r.title,
      metadata: { status },
    }).catch(() => {});

    res.json(r);
  },

  listComments: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const reportId = req.params.id;

    // Verify the user can access this report
    const report = await service.get(orgId, reportId);
    if (!report) return res.status(404).json({ error: "Report not found." });
    if (user.role === "researcher" && report.reporterId !== user.id) {
      return res.status(403).json({ error: "Not authorized." });
    }
    if (user.role === "manager") {
      const program = await programRepo.get(orgId, report.programId);
      if (!program || program.managerId !== user.id) {
        return res.status(403).json({ error: "Not authorized." });
      }
    }

    const comments = await service.comments(orgId, reportId);
    // Filter out internal-only comments for researchers
    const filtered = user.role === "researcher"
      ? comments.filter((c) => c.visibility === "researcher")
      : comments;

    res.json(filtered);
  },

  addComment: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const reportId = req.params.id;
    const { body, visibility: requestedVisibility } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: "Comment body is required." });
    }

    // Verify the user can access this report
    const report = await service.get(orgId, reportId);
    if (!report) return res.status(404).json({ error: "Report not found." });
    if (user.role === "researcher" && report.reporterId !== user.id) {
      return res.status(403).json({ error: "Not authorized." });
    }
    if (user.role === "manager") {
      const program = await programRepo.get(orgId, report.programId);
      if (!program || program.managerId !== user.id) {
        return res.status(403).json({ error: "Not authorized." });
      }
    }

    const dbUser = await userRepo.getById(user.id);
    const visibility = user.role === "researcher" ? "researcher" : requestedVisibility ?? "researcher";
    const author = { id: user.id, name: dbUser?.name || user.id, role: user.role };
    const comment = await service.addComment(orgId, reportId, xss(body.trim()), author, visibility);

    // Notify the reporter (unless they are the commenter) — reuse report already fetched above
    if (visibility === "researcher" && report.reporterId !== user.id) {
      notifService.onCommentAdded({
        orgId,
        reporterId: report.reporterId,
        reportId: report.id,
        reportTitle: report.title,
        commenterName: author.name,
      }).catch(() => {});
    }

    auditService.log({
      orgId,
      actorId: user.id,
      actorName: author.name,
      action: "ADD_COMMENT",
      targetType: "report",
      targetId: reportId,
      targetName: report.title,
      metadata: { visibility },
    }).catch(() => {});

    res.status(201).json(comment);
  },

  /**
   * POST /api/reports/:id/assign
   * Assign an employee to a report. Manager/admin only.
   */
  assignEmployee: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const reportId = req.params.id;
    const { employeeId } = req.body;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers and admins can assign employees." });
    }

    if (!employeeId || typeof employeeId !== "string") {
      return res.status(400).json({ error: "employeeId is required." });
    }

    const report = await service.get(orgId, reportId);
    if (!report) return res.status(404).json({ error: "Report not found." });

    if (user.role === "manager") {
      const program = await programRepo.get(orgId, report.programId);
      if (!program || program.managerId !== user.id) {
        return res.status(403).json({ error: "Not authorized to assign employees for this report." });
      }
    }

    // Validate employee exists and belongs to org
    const employee = await userRepo.getById(employeeId);
    if (!employee || employee.orgId !== orgId) {
      return res.status(400).json({ error: "Invalid employee." });
    }
    if (employee.role !== "employee" && employee.role !== "manager") {
      return res.status(400).json({ error: "User is not an employee." });
    }

    const updated = await reportRepo.assignEmployee(orgId, reportId, employeeId, employee.name || employeeId);
    if (!updated) return res.status(500).json({ error: "Failed to assign employee." });

    auditService.log({
      orgId,
      actorId: user.id,
      actorName: user.id,
      action: "ASSIGN_REPORT",
      targetType: "report",
      targetId: reportId,
      targetName: report.title,
    }).catch(() => {});

    res.json(updated);
  },

  /**
   * PATCH /api/reports/:id/workflow
   * Update the internal workflow/remediation status. Manager/admin only.
   */
  updateWorkflowStatus: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const reportId = req.params.id;
    const { workflowStatus } = req.body;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers and admins can update workflow status." });
    }

    const validStatuses = ["Not Started", "Investigating", "In Progress", "Needs Info", "Testing Fix", "Resolved", "Closed"];
    if (!workflowStatus || !validStatuses.includes(workflowStatus)) {
      return res.status(400).json({ error: `workflowStatus must be one of: ${validStatuses.join(", ")}` });
    }

    const report = await service.get(orgId, reportId);
    if (!report) return res.status(404).json({ error: "Report not found." });

    if (user.role === "manager") {
      const program = await programRepo.get(orgId, report.programId);
      if (!program || program.managerId !== user.id) {
        return res.status(403).json({ error: "Not authorized to update workflow status on this report." });
      }
    }

    const updated = await reportRepo.updateWorkflowStatus(orgId, reportId, workflowStatus);
    if (!updated) return res.status(500).json({ error: "Failed to update workflow status." });

    auditService.log({
      orgId,
      actorId: user.id,
      actorName: user.id,
      action: "UPDATE_WORKFLOW",
      targetType: "report",
      targetId: reportId,
      targetName: report.title,
      metadata: { workflowStatus },
    }).catch(() => {});

    res.json(updated);
  },
};
