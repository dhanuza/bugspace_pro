import type { Request, Response } from "express";
import { programRepo, userRepo, auditLogRepo, notificationRepo } from "../repositories/index.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { NotificationService } from "../services/NotificationService.js";
import xss from "xss";

const auditService = new AuditLogService(auditLogRepo);
const notifService = new NotificationService(notificationRepo);

export const ProgramController = {
  /**
   * GET /api/programs
   * Lists programs for the current org.
   * - Admins see all programs.
   * - Managers see all programs in their org.
   * - Researchers see only programs they are assigned to.
   */
  list: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;

    const options = {
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      limit: Number(req.query.limit ?? 50),
      cursor: typeof req.query.cursor === "string" ? req.query.cursor : undefined,
    };

    let programs;
    if (user.role === "admin") {
      programs = await programRepo.listAll(options);
    } else if (user.role === "researcher") {
      programs = await programRepo.listByResearcher(orgId, user.id, options);
    } else if (user.role === "manager") {
      const allPrograms = await programRepo.list(orgId, options);
      programs = allPrograms.filter(p => p.managerId === user.id);
    } else {
      return res.status(403).json({ error: "Not authorized to list programs." });
    }

    return res.json({ programs });
  },

  /**
   * GET /api/programs/:id
   * Returns a single program if the user is authorized.
   */
  get: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const { id } = req.params;

    const program = await programRepo.get(orgId, id);
    if (!program) return res.status(404).json({ error: "Program not found." });

    // Researchers can only see programs they are assigned to
    if (user.role === "researcher" && !program.assignedResearchers.includes(user.id)) {
      return res.status(403).json({ error: "Not authorized to view this program." });
    }
    // Managers can only see programs they created
    if (user.role === "manager" && program.managerId !== user.id) {
      return res.status(403).json({ error: "Not authorized to view this program." });
    }
    if (user.role === "employee") {
      return res.status(403).json({ error: "Not authorized to view this program." });
    }

    return res.json({ program });
  },

  /**
   * POST /api/programs
   * Creates a new program. Only managers and admins.
   */
  create: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers and admins can create programs." });
    }

    const {
      name,
      description,
      scopeSummary,
      scopes,
      assignedResearchers,
      assignedEmployees,
      testingGuidelines,
      status,
      bannerUrl,
      logoUrl,
      minReward,
      maxReward,
    } = req.body;

    if ((assignedResearchers && assignedResearchers.length > 0) || (assignedEmployees && assignedEmployees.length > 0)) {
      return res.status(400).json({ error: "Create programs first, then assign users through /assign." });
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Program name is required." });
    }
    if (name.length > 200) {
      return res.status(400).json({ error: "Program name must be under 200 characters." });
    }

    const validStatuses = ["draft", "active", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    // Validate scopes array
    if (scopes && !Array.isArray(scopes)) {
      return res.status(400).json({ error: "Scopes must be an array." });
    }

    const program = await programRepo.create(orgId, {
      name: name.trim(),
      description: description ? xss(description.trim()) : "",
      scopeSummary: scopeSummary ? xss(scopeSummary.trim()) : "",
      scopes: scopes ?? [],
      assignedResearchers: [],
      assignedEmployees: [],
      testingGuidelines: testingGuidelines ? xss(testingGuidelines.trim()) : "",
      managerId: user.id,
      status: status ?? "draft",
      ...(bannerUrl ? { bannerUrl } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      ...(minReward !== undefined ? { minReward } : {}),
      ...(maxReward !== undefined ? { maxReward } : {}),
    });

    // Audit log (fire-and-forget)
    auditService.log({
      orgId,
      actorId: user.id,
      actorName: user.id,
      action: "CREATE_PROGRAM",
      targetType: "program",
      targetId: program.id,
      targetName: program.name,
    }).catch(() => {});

    return res.status(201).json({ program });
  },

  /**
   * PATCH /api/programs/:id
   * Updates a program. Only the owning manager or admin.
   */
  update: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const { id } = req.params;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers and admins can update programs." });
    }

    // Strip assignment fields if they exist in req.body to prevent edit failures.
    // Assignments are updated separately via the /assign endpoint.
    delete req.body.assignedResearchers;
    delete req.body.assignedEmployees;

    const existing = await programRepo.get(orgId, id);
    if (!existing) return res.status(404).json({ error: "Program not found." });

    // Managers can only update their own programs
    if (user.role === "manager" && existing.managerId !== user.id) {
      return res.status(403).json({ error: "Not authorized to update this program." });
    }

    // Sanitize incoming fields for update
    const updatePayload = { ...req.body };
    if (updatePayload.description) updatePayload.description = xss(updatePayload.description.trim());
    if (updatePayload.scopeSummary) updatePayload.scopeSummary = xss(updatePayload.scopeSummary.trim());
    if (updatePayload.testingGuidelines) updatePayload.testingGuidelines = xss(updatePayload.testingGuidelines.trim());
    // Strip empty-string image URLs so they don't overwrite stored URLs with blanks
    if (updatePayload.bannerUrl === "") delete updatePayload.bannerUrl;
    if (updatePayload.logoUrl === "") delete updatePayload.logoUrl;

    const updated = await programRepo.update(orgId, id, updatePayload);
    if (!updated) return res.status(500).json({ error: "Failed to update program." });

    // Audit log
    auditService.log({
      orgId,
      actorId: user.id,
      actorName: user.id,
      action: "UPDATE_PROGRAM",
      targetType: "program",
      targetId: id,
      targetName: updated.name,
    }).catch(() => {});

    return res.json({ program: updated });
  },

  /**
   * DELETE /api/programs/:id
   * Deletes a program. Only the owning manager or admin.
   */
  remove: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const { id } = req.params;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers and admins can delete programs." });
    }

    const existing = await programRepo.get(orgId, id);
    if (!existing) return res.status(404).json({ error: "Program not found." });

    // Managers can only delete their own programs
    if (user.role === "manager" && existing.managerId !== user.id) {
      return res.status(403).json({ error: "Not authorized to delete this program." });
    }

    const deleted = await programRepo.remove(orgId, id);
    if (!deleted) return res.status(500).json({ error: "Failed to delete program." });

    // Audit log
    auditService.log({
      orgId,
      actorId: user.id,
      actorName: user.id,
      action: "DELETE_PROGRAM",
      targetType: "program",
      targetId: id,
      targetName: existing.name,
    }).catch(() => {});

    return res.status(204).send();
  },

  /**
   * GET /api/programs/:id/participants
   * Returns assigned researchers and employees with user details.
   */
  getParticipants: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const { id } = req.params;

    const program = await programRepo.get(orgId, id);
    if (!program) return res.status(404).json({ error: "Program not found." });

    if (req.user!.role === "researcher" && !program.assignedResearchers.includes(req.user!.id)) {
      return res.status(403).json({ error: "Not authorized to view participants for this program." });
    }
    if (req.user!.role === "manager" && program.managerId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized to view participants for this program." });
    }
    if (req.user!.role === "employee") {
      return res.status(403).json({ error: "Not authorized to view participants for this program." });
    }

    const allUsers = await userRepo.listByOrg(orgId);
    const researchers = allUsers.filter(u => program.assignedResearchers.includes(u.id));
    const employees = allUsers.filter(u => program.assignedEmployees.includes(u.id));

    return res.json({ researchers, employees });
  },

  /**
   * POST /api/programs/:id/assign
   * Assigns researchers or employees to a program.
   */
  assign: async (req: Request, res: Response) => {
    const orgId = req.orgId!;
    const user = req.user!;
    const { id } = req.params;

    if (user.role !== "manager" && user.role !== "admin") {
      return res.status(403).json({ error: "Only managers and admins can assign users." });
    }

    const existing = await programRepo.get(orgId, id);
    if (!existing) return res.status(404).json({ error: "Program not found." });

    // Managers can only assign users to their own programs
    if (user.role === "manager" && existing.managerId !== user.id) {
      return res.status(403).json({ error: "Not authorized to assign users to this program." });
    }

    const { assignedResearchers, assignedEmployees } = req.body;
    
    // Validate users before assigning
    const allUsers = await userRepo.listByOrg(orgId);
    
    const updatePayload: any = {};
    
    if (assignedResearchers && Array.isArray(assignedResearchers)) {
        const uniqueResearchers = Array.from(new Set(assignedResearchers));
        for (const researcherId of uniqueResearchers) {
            const r = allUsers.find(u => u.id === researcherId);
            if (!r || r.role !== "researcher") {
                return res.status(400).json({ error: `Invalid researcher ID: ${researcherId}` });
            }
        }
        updatePayload.assignedResearchers = uniqueResearchers;
    }
    
    if (assignedEmployees && Array.isArray(assignedEmployees)) {
        const uniqueEmployees = Array.from(new Set(assignedEmployees));
        for (const employeeId of uniqueEmployees) {
            const e = allUsers.find(u => u.id === employeeId);
            if (!e || e.role !== "employee") {
                return res.status(400).json({ error: `Invalid employee ID: ${employeeId}` });
            }
        }
        updatePayload.assignedEmployees = uniqueEmployees;
    }

    const updated = await programRepo.update(orgId, id, updatePayload);

    // Notify newly assigned researchers
    if (updatePayload.assignedResearchers) {
      const previousIds = new Set(existing.assignedResearchers);
      const newResearcherIds = updatePayload.assignedResearchers.filter(
        (rid: string) => !previousIds.has(rid)
      );
      for (const researcherId of newResearcherIds) {
        notifService.onAssigned({
          orgId,
          researcherId,
          programId: id,
          programName: existing.name,
        }).catch(() => {});
      }
    }

    auditService.log({
      orgId,
      actorId: user.id,
      actorName: user.id,
      action: "ASSIGN_PROGRAM",
      targetType: "program",
      targetId: id,
      targetName: updated?.name,
    }).catch(() => {});

    return res.json({ program: updated });
  },
};
