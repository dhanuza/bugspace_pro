import type { INotificationRepository } from "../interfaces/INotificationRepository.js";
import type { Notification } from "../types/index.js";

export class NotificationService {
  constructor(private repo: INotificationRepository) {}

  async listForUser(orgId: string, userId: string): Promise<Notification[]> {
    return this.repo.list(orgId, userId);
  }

  async create(
    orgId: string,
    input: Omit<Notification, "id" | "createdAt" | "read">
  ): Promise<Notification> {
    return this.repo.create(orgId, input);
  }

  async markAsRead(orgId: string, userId: string, id: string): Promise<Notification | null> {
    return this.repo.markAsRead(orgId, userId, id);
  }

  async markAllAsRead(orgId: string, userId: string): Promise<boolean> {
    return this.repo.markAllAsRead(orgId, userId);
  }

  async countUnread(orgId: string, userId: string): Promise<number> {
    return this.repo.countUnread(orgId, userId);
  }

  /**
   * Fire a notification when a report's status changes.
   * Called from ReportController after a status/workflow update.
   */
  async onStatusUpdated(opts: {
    orgId: string;
    reporterId: string;
    reportId: string;
    reportTitle: string;
    newStatus: string;
  }): Promise<void> {
    await this.repo.create(opts.orgId, {
      orgId: opts.orgId,
      userId: opts.reporterId,
      type: "status_updated",
      title: "Report Status Updated",
      message: `Your report "${opts.reportTitle}" status changed to: ${opts.newStatus}.`,
      reportId: opts.reportId,
    });
  }

  /**
   * Fire a notification when a manager requests more information.
   */
  async onNeedsInfo(opts: {
    orgId: string;
    reporterId: string;
    reportId: string;
    reportTitle: string;
  }): Promise<void> {
    await this.repo.create(opts.orgId, {
      orgId: opts.orgId,
      userId: opts.reporterId,
      type: "needs_info",
      title: "Action Required",
      message: `Your report "${opts.reportTitle}" needs more information.`,
      reportId: opts.reportId,
    });
  }

  /**
   * Fire a notification when a comment is added to a researcher's report.
   */
  async onCommentAdded(opts: {
    orgId: string;
    reporterId: string;
    reportId: string;
    reportTitle: string;
    commenterName: string;
  }): Promise<void> {
    await this.repo.create(opts.orgId, {
      orgId: opts.orgId,
      userId: opts.reporterId,
      type: "comment_added",
      title: "New Comment on Your Report",
      message: `${opts.commenterName} commented on "${opts.reportTitle}".`,
      reportId: opts.reportId,
    });
  }

  /**
   * Fire a notification when a researcher is assigned to a program.
   */
  async onAssigned(opts: {
    orgId: string;
    researcherId: string;
    programId: string;
    programName: string;
  }): Promise<void> {
    await this.repo.create(opts.orgId, {
      orgId: opts.orgId,
      userId: opts.researcherId,
      type: "assigned",
      title: "New Program Assignment",
      message: `You have been assigned to the program: "${opts.programName}".`,
      reportId: opts.programId,
    });
  }
}
