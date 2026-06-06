import type { Request, Response } from "express";
import { reportRepo, programRepo, userRepo, notificationRepo } from "../repositories/index.js";
import type { ReportStatus } from "../types/index.js";

const REPORT_STATUSES: ReportStatus[] = ["New", "Needs Info", "Triaged", "Valid", "Duplicate", "Closed"];
const SEVERITIES = ["informational", "low", "medium", "high", "critical"] as const;

export const DashboardController = {
  /**
   * GET /api/dashboard/manager
   * Lightweight aggregate payload. Uses count queries and a small recent list
   * instead of loading full org datasets into memory.
   */
  manager: async (req: Request, res: Response) => {
    try {
      const orgId = req.orgId!;

      const [
        totalReports,
        totalPrograms,
        activePrograms,
        totalUsers,
        recentReports,
        statusCounts,
      ] = await Promise.all([
        reportRepo.count(orgId),
        programRepo.count(orgId),
        programRepo.count(orgId, "active"),
        userRepo.countByOrg(orgId),
        reportRepo.list(orgId, { limit: 5 }),
        Promise.all(REPORT_STATUSES.map(async (status) => [status, await reportRepo.count(orgId, { status })] as const)),
      ]);

      const reportsByStatus = Object.fromEntries(statusCounts);
      const reportsBySeverity: Record<string, number> = {};
      for (const severity of SEVERITIES) {
        reportsBySeverity[severity] = recentReports.filter((r) => r.severity === severity).length;
      }

      return res.json({
        totalReports,
        totalPrograms,
        totalUsers,
        activePrograms,
        reportsByStatus,
        reportsBySeverity,
        recentReports: recentReports.map(({ id, title, severity, status, createdAt, reporterName, programName }) => ({
          id,
          title,
          severity,
          status,
          createdAt,
          reporterName,
          programName,
        })),
      });
    } catch (error) {
      console.error("[DashboardController.manager] Error:", error);
      return res.status(500).json({ error: "Failed to load dashboard." });
    }
  },

  /**
   * GET /api/dashboard/researcher
   * Lightweight aggregate payload scoped to the authenticated researcher.
   */
  researcher: async (req: Request, res: Response) => {
    try {
      const orgId = req.orgId!;
      const user = req.user!;

      const [
        assignedPrograms,
        activePrograms,
        submittedReports,
        needsInfoReports,
        closedReports,
        recentReports,
        unreadNotifications,
        statusCounts,
      ] = await Promise.all([
        programRepo.countByResearcher(orgId, user.id),
        programRepo.countByResearcher(orgId, user.id, "active"),
        reportRepo.countByReporter(orgId, user.id),
        reportRepo.countByReporter(orgId, user.id, { status: "Needs Info" }),
        reportRepo.countByReporter(orgId, user.id, { status: "Closed" }),
        reportRepo.listByReporter(orgId, user.id, { limit: 5 }),
        notificationRepo.countUnread(orgId, user.id),
        Promise.all(REPORT_STATUSES.map(async (status) => [status, await reportRepo.countByReporter(orgId, user.id, { status })] as const)),
      ]);

      const reportsByStatus = Object.fromEntries(statusCounts);

      return res.json({
        assignedPrograms,
        activePrograms,
        submittedReports,
        triagedReports: (reportsByStatus.Triaged ?? 0) + (reportsByStatus.Valid ?? 0),
        needsInfoReports,
        closedReports,
        reportsByStatus,
        recentReports: recentReports.map(({ id, title, severity, status, updatedAt, createdAt, programName }) => ({
          id,
          title,
          severity,
          status,
          updatedAt: updatedAt ?? createdAt,
          programName,
        })),
        unreadNotifications,
      });
    } catch (error) {
      console.error("[DashboardController.researcher] Error:", error);
      return res.status(500).json({ error: "Failed to load dashboard." });
    }
  },
};
