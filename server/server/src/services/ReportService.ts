import type { IReportRepository } from "../interfaces/IReportRepository.js";
import type { ReportStatus } from "../types/index.js";

export class ReportService {
  constructor(private repo: IReportRepository) {}
  list(orgId: string, options?: Parameters<IReportRepository["list"]>[1]) { return this.repo.list(orgId, options); }
  get(orgId: string, id: string) { return this.repo.get(orgId, id); }
  create(orgId: string, input: any, reporter: { id: string; name: string }) {
    return this.repo.create(orgId, input, reporter);
  }
  updateStatus(orgId: string, id: string, status: ReportStatus) {
    return this.repo.updateStatus(orgId, id, status);
  }
  comments(orgId: string, reportId: string) { return this.repo.listComments(orgId, reportId); }
  addComment(
    orgId: string,
    reportId: string,
    body: string,
    author: Parameters<IReportRepository["addComment"]>[3],
    visibility: Parameters<IReportRepository["addComment"]>[4]
  ) {
    return this.repo.addComment(orgId, reportId, body, author, visibility);
  }
}
