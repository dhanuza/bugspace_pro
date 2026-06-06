import type { IReportRepository, ReportListOptions } from "../interfaces/IReportRepository.js";
import type { Comment, Report, ReportStatus } from "../types/index.js";
import admin from "../config/firebase.js";

const db = admin.firestore();
const reportsCollection = db.collection("reports");

export class FirestoreReportRepository implements IReportRepository {
  private applyListOptions(query: FirebaseFirestore.Query, options?: ReportListOptions) {
    let q = query;
    if (options?.status) q = q.where("status", "==", options.status);
    if (options?.programId) q = q.where("programId", "==", options.programId);
    if (options?.cursor) q = q.startAfter(options.cursor);
    q = q.limit(Math.min(options?.limit ?? 50, 100));
    return q;
  }

  async list(orgId: string, options?: ReportListOptions): Promise<Report[]> {
    try {
      const snapshot = await this.applyListOptions(
        reportsCollection.where("orgId", "==", orgId),
        options
      ).get();
      const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Report));
      reports.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return reports;
    } catch (error) {
      console.error("[FirestoreReportRepository] Error listing reports:", error);
      throw error;
    }
  }

  async listByReporter(orgId: string, reporterId: string, options?: ReportListOptions): Promise<Report[]> {
    try {
      const snapshot = await this.applyListOptions(
        reportsCollection
          .where("orgId", "==", orgId)
          .where("reporterId", "==", reporterId),
        options
      ).get();
      const reports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Report));
      reports.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return reports;
    } catch (error) {
      console.error("[FirestoreReportRepository] Error listing reports by reporter:", error);
      throw error;
    }
  }

  async get(orgId: string, id: string): Promise<Report | null> {
    try {
      const doc = await reportsCollection.doc(id).get();
      if (!doc.exists) return null;
      const report = { id: doc.id, ...doc.data() } as Report;
      if (report.orgId !== orgId) return null;
      return report;
    } catch (error) {
      console.error("[FirestoreReportRepository] Error getting report:", error);
      throw error;
    }
  }

  async create(
    orgId: string,
    input: Partial<Report>,
    reporter: { id: string; name: string }
  ): Promise<Report> {
    try {
      const now = new Date().toISOString();
      const reportData: any = {
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

      const docRef = await reportsCollection.add(reportData);
      return { id: docRef.id, ...reportData } as Report;
    } catch (error) {
      console.error("[FirestoreReportRepository] Error creating report:", error);
      throw error;
    }
  }

  async updateStatus(orgId: string, id: string, status: ReportStatus): Promise<Report | null> {
    try {
      const docRef = reportsCollection.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const report = { id: doc.id, ...doc.data() } as Report;
      if (report.orgId !== orgId) return null;

      const updateData = {
        status,
        updatedAt: new Date().toISOString(),
      };
      await docRef.update(updateData);
      return { ...report, ...updateData };
    } catch (error) {
      console.error("[FirestoreReportRepository] Error updating report status:", error);
      throw error;
    }
  }

  async assignEmployee(
    orgId: string,
    reportId: string,
    employeeId: string,
    employeeName: string
  ): Promise<Report | null> {
    try {
      const docRef = reportsCollection.doc(reportId);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const report = { id: doc.id, ...doc.data() } as Report;
      if (report.orgId !== orgId) return null;

      const updateData = {
        assignedEmployeeId: employeeId,
        assignedEmployeeName: employeeName,
        updatedAt: new Date().toISOString(),
      };
      await docRef.update(updateData);
      return { ...report, ...updateData };
    } catch (error) {
      console.error("[FirestoreReportRepository] Error assigning employee to report:", error);
      throw error;
    }
  }

  async updateWorkflowStatus(
    orgId: string,
    reportId: string,
    workflowStatus: string
  ): Promise<Report | null> {
    try {
      const docRef = reportsCollection.doc(reportId);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const report = { id: doc.id, ...doc.data() } as Report;
      if (report.orgId !== orgId) return null;

      const updateData: any = {
        workflowStatus,
        updatedAt: new Date().toISOString(),
      };

      // Auto-sync report status
      if (workflowStatus === "Closed") {
        updateData.status = "Closed";
      } else if (workflowStatus === "Resolved") {
        updateData.status = "Valid";
      }

      await docRef.update(updateData);
      return { ...report, ...updateData };
    } catch (error) {
      console.error("[FirestoreReportRepository] Error updating workflow status:", error);
      throw error;
    }
  }

  async count(orgId: string, filters?: Pick<ReportListOptions, "status" | "programId">): Promise<number> {
    let query: FirebaseFirestore.Query = reportsCollection.where("orgId", "==", orgId);
    if (filters?.status) query = query.where("status", "==", filters.status);
    if (filters?.programId) query = query.where("programId", "==", filters.programId);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  async countByReporter(
    orgId: string,
    reporterId: string,
    filters?: Pick<ReportListOptions, "status" | "programId">
  ): Promise<number> {
    let query: FirebaseFirestore.Query = reportsCollection
      .where("orgId", "==", orgId)
      .where("reporterId", "==", reporterId);
    if (filters?.status) query = query.where("status", "==", filters.status);
    if (filters?.programId) query = query.where("programId", "==", filters.programId);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  async listComments(orgId: string, reportId: string): Promise<Comment[]> {
    try {
      const doc = await reportsCollection.doc(reportId).get();
      if (!doc.exists) return [];
      const report = { id: doc.id, ...doc.data() } as Report;
      if (report.orgId !== orgId) return [];

      const snapshot = await reportsCollection
        .doc(reportId)
        .collection("comments")
        .orderBy("createdAt", "asc")
        .get();

      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
    } catch (error) {
      console.error("[FirestoreReportRepository] Error listing comments:", error);
      throw error;
    }
  }

  async addComment(
    orgId: string,
    reportId: string,
    body: string,
    author: { id: string; name: string; role: Comment["authorRole"] },
    visibility: Comment["visibility"]
  ): Promise<Comment> {
    try {
      const docRef = reportsCollection.doc(reportId);
      const doc = await docRef.get();
      if (!doc.exists) throw new Error("Report not found");
      const report = { id: doc.id, ...doc.data() } as Report;
      if (report.orgId !== orgId) throw new Error("Report not found");

      const commentData = {
        reportId,
        authorId: author.id,
        authorName: author.name,
        authorRole: author.role,
        body,
        visibility,
        createdAt: new Date().toISOString(),
        orgId,
      };

      const commentDocRef = await docRef.collection("comments").add(commentData);
      return { id: commentDocRef.id, ...commentData } as Comment;
    } catch (error) {
      console.error("[FirestoreReportRepository] Error adding comment:", error);
      throw error;
    }
  }
}
