import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { reportRepository } from "../repositories/ApiReportRepository";
import type { Comment, Report, ReportStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";

export const Route = createFileRoute("/_app/reports/$reportId")({
  component: ReportDetails,
});

const STATUSES: ReportStatus[] = ["New", "Needs Info", "Triaged", "Valid", "Duplicate", "Closed"];

const placeholderReport = (id: string): Report => ({
  id,
  title: "Stored XSS in profile bio renderer",
  programId: "p1",
  programName: "Web App",
  severity: "high",
  status: "Triaged",
  reporterId: "u-res",
  reporterName: "Riley Researcher",
  description:
    "User-supplied markdown in the profile bio is rendered without sanitization, allowing arbitrary script execution in viewer context.",
  createdAt: new Date().toISOString(),
  orgId: "org-1",
});

const placeholderComments: Comment[] = [
  { id: "c1", reportId: "r1", authorId: "u-mgr", authorName: "Morgan Manager", body: "Reproduced on staging. Moving to triage.", createdAt: new Date().toISOString() },
  { id: "c2", reportId: "r1", authorId: "u-res", authorName: "Riley Researcher", body: "Attached PoC payload in the description.", createdAt: new Date().toISOString() },
];

function ReportDetails() {
  const { reportId } = Route.useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    reportRepository.get(reportId).then(setReport).catch(() => setReport(placeholderReport(reportId)));
    reportRepository.comments(reportId).then(setComments).catch(() => setComments(placeholderComments));
  }, [reportId]);

  const updateStatus = async (status: ReportStatus) => {
    if (!report) return;
    setReport({ ...report, status });
    try { await reportRepository.updateStatus(report.id, status); } catch {}
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const optimistic: Comment = {
      id: `tmp-${Date.now()}`,
      reportId,
      authorId: "me",
      authorName: "You",
      body: draft,
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [...c, optimistic]);
    setDraft("");
    try { await reportRepository.addComment(reportId, optimistic.body); } catch {}
  };

  if (!report) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6 min-w-0">
        <div>
          <div className="text-xs text-muted-foreground">#{report.id} · {report.programName}</div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mt-1">{report.title}</h1>
          <div className="flex items-center gap-2 mt-3">
            <StatusBadge status={report.status} />
            <span className="text-xs text-muted-foreground capitalize">Severity: {report.severity}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-medium mb-2">Description</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description || "No description available"}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-medium mb-4">Activity</h2>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">
                  {c.authorName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{c.authorName}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={addComment} className="mt-5 flex flex-col sm:flex-row gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm"
            />
            <button className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90 shrink-0">
              Send
            </button>
          </form>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-3">Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`text-xs px-2 py-1.5 rounded-md border transition-colors ${
                  report.status === s
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Reporter</span><span>{report.reporterName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Program</span><span>{report.programName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(report.createdAt).toLocaleDateString()}</span></div>
        </div>
      </aside>
    </div>
  );
}
