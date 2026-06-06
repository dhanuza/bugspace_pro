import type { Request, Response } from "express";
import { OrganizationService } from "../services/OrganizationService.js";
import { orgRepo, userRepo } from "../repositories/index.js";
import type { Organization, User } from "../types/index.js";

const service = new OrganizationService(orgRepo);

export const OrganizationController = {
  /**
   * GET /api/organizations
   * Admin-only: list all organizations in the system.
   */
  list: async (_req: Request, res: Response) => {
    try {
      const [orgs, allUsers] = await Promise.all([
        service.list(),
        userRepo.listAll()
      ]);

      const orgsWithCounts = orgs.map(org => {
        const orgUsers = allUsers.filter(u => u.orgId === org.id);
        return {
          ...org,
          counts: {
            manager: orgUsers.filter(u => u.role === "manager").length,
            researcher: orgUsers.filter(u => u.role === "researcher").length,
            employee: orgUsers.filter(u => u.role === "employee").length,
            total: orgUsers.length
          }
        };
      });

      return res.status(200).json(orgsWithCounts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to list organizations";
      return res.status(500).json({ error: message });
    }
  },

  /**
   * GET /api/organizations/:id
   * Admin/manager: fetch a single org by id.
   */
  get: async (req: Request, res: Response) => {
    try {
      const org = await service.get(req.params.id);
      if (!org) return res.status(404).json({ error: "Organization not found." });
      return res.status(200).json(org);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get organization";
      return res.status(500).json({ error: message });
    }
  },

  /**
   * POST /api/organizations
   * Admin-only: create a new tenant organization.
   * Body: { name: string, domain?: string }
   */
  create: async (req: Request, res: Response) => {
    const { name, domain, managerId, researcherId, employeeId } = req.body as { 
      name?: string; 
      domain?: string;
      managerId?: string;
      researcherId?: string;
      employeeId?: string;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "'name' is required and must be a non-empty string." });
    }

    try {
      const org = await service.create({ name: name.trim(), domain }, req.user!.id);
      
      // Assign users to the new organization if provided
      const assignments = [];
      if (managerId) assignments.push(userRepo.updateOrg(managerId, org.id));
      if (researcherId) assignments.push(userRepo.updateOrg(researcherId, org.id));
      if (employeeId) assignments.push(userRepo.updateOrg(employeeId, org.id));
      
      if (assignments.length > 0) {
        await Promise.all(assignments);
      }

      return res.status(201).json(org);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create organization";
      return res.status(500).json({ error: message });
    }
  },
};
