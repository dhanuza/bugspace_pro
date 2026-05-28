import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { reportRepository } from "@/repositories/ApiReportRepository";
import type { Report } from "@/types";
import { StatusBadge } from "./StatusBadge";

const placeholder: Report[] = [
  {
    id: "R-204",
    title: "Stored XSS in profile bio renderer",
    programId: "p1",
    programName: "Web App",
    severity: "high",
    status: "Triaged",
    reporterId: "u-res",
    reporterName: "Riley Researcher",
    description: "",
    createdAt: new Date().toISOString(),
    orgId: "org-1",
  },
  {
    id: "R-203",
    title: "IDOR on /api/invoices/{id}",
    programId: "p2",
    programName: "Mobile API",
    severity: "critical",
    status: "New",
    reporterId: "u-res",
    reporterName: "Riley Researcher",
    description: "",
    createdAt: new Date().toISOString(),
    orgId: "org-1",
  },
  {
    id: "R-202",
    title: "Open redirect in OAuth callback",
    programId: "p1",
    programName: "Web App",
    severity: "medium",
    status: "Needs Info",
    reporterId: "u-res",
    reporterName: "Riley Researcher",
    description: "",
    createdAt: new Date().toISOString(),
    orgId: "org-1",
  },
  {
    id: "R-201",
    title: "Outdated TLS cipher accepted",
    programId: "p3",
    programName: "Internal Tools",
    severity: "low",
    status: "Closed",
    reporterId: "u-res",
    reporterName: "Riley Researcher",
    description: "",
    createdAt: new Date().toISOString(),
    orgId: "org-1",
  },
];

export function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const assignedPrograms = ["p1", "p2"];
  const [page, setPage] = useState(2);
  const pageSize = 2;
  console.log("ALL REPORTS STATE:", reports);

  useEffect(() => {
    setLoading(true);
    reportRepository
      .list()
      .then((data) => {
        console.log("API DATA:", data);
        setReports(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load reports");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const filteredReports = reports.filter((r) => {
    const matchesProgram = assignedPrograms.length === 0 || assignedPrograms.includes(r.programId);
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesProgram && matchesSearch && matchesStatus;
  });
  console.log("ALL REPORTS:", reports.length);
  console.log("FILTERED:", filteredReports.length);
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "severity") {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return order[b.severity] - order[a.severity];
    }
    return 0;
  });
  const startIndex = (page - 1) * pageSize;
  const paginatedReports = sortedReports.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (paginatedReports.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg">
        No reports found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search reports..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">All Status</option>
        <option value="New">New</option>
        <option value="Triaged">Triaged</option>
        <option value="Needs Info">Needs Info</option>
        <option value="Closed">Closed</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      >
        <option value="newest">Newest First</option>
        <option value="severity">Severity (High → Low)</option>
      </select>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[560px] border-collapse">
          <thead className="bg-secondary/40 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">ID</th>
              <th className="text-left px-4 py-2 font-medium">Title</th>
              <th className="text-left px-4 py-2 font-medium">Program</th>
              <th className="text-left px-4 py-2 font-medium">Severity</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border hover:bg-secondary/10 transition-colors"
                >
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-4 py-2">
                  <Link
                    to="/reports/$reportId"
                    params={{ reportId: r.id }}
                    className="hover:text-primary cursor-pointer"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-blocktext-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium">
                    {r.programName}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize
                    ${
                      r.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : r.severity === "high"
                          ? "bg-orange-100 text-orange-700"
                          : r.severity === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {r.description ? r.description.slice(0, 50) + "..." : "No description"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button
            disabled={startIndex + pageSize >= filteredReports.length}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
