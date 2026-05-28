/**
 * AuditLogViewer — read-only, immutable audit log display.
 *
 * Features:
 * - Timeline + table layout
 * - Filter by action type
 * - Skeleton loading
 * - Empty state
 * - Timestamps formatted as locale-relative strings
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditLogRepository } from "../../repositories/ApiAuditLogRepository";
import type { AuditLog } from "../../types";
import { Search, RefreshCw, Clock, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

const ITEMS_PER_PAGE = 5;

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 py-4 border-t border-border animate-pulse">
      <div className="mt-1 h-8 w-8 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="h-3 bg-muted rounded w-20" />
    </div>
  );
}

export function AuditLogViewer() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditLogRepository.list(),
  });

  const uniqueActions = ["all", ...Array.from(new Set(logs.map((l) => l.action)))];

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.actorName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.targetId.toLowerCase().includes(q);
    const matchAction = filterAction === "all" || l.action === filterAction;
    return matchSearch && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedLogs = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">
          Complete audit trail of all platform activities
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actor, action, target…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{a === "all" ? "All actions" : a}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <span className="text-xs text-muted-foreground ml-auto italic flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" /> Read-only — audit records are immutable
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          Failed to load audit logs
        </div>
      )}

      {/* Timeline */}
      <div className="bg-card border border-border rounded-lg px-6 divide-y divide-border">
        {isLoading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && paginatedLogs.length === 0 && (
          <div className="py-16 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search || filterAction !== "all" ? "No logs match your filters." : "No audit events recorded yet."}
            </p>
          </div>
        )}

        {!isLoading && paginatedLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-4 py-4">
            {/* Actor avatar placeholder */}
            <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {log.actorName.charAt(0).toUpperCase()}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{log.actorName}</span>
                {" "}
                <span className="text-muted-foreground">{log.action}</span>
                {log.targetName && (
                  <span> <span className="font-medium text-foreground">{log.targetName}</span></span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {log.targetType}/{log.targetId}
              </p>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </p>
              )}
            </div>
            {/* Timestamp */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground whitespace-nowrap">{formatRelative(log.createdAt)}</p>
              <p className="text-xs text-muted-foreground/60 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIdx}</span> to{" "}
            <span className="font-medium text-foreground">{endIdx}</span> of{" "}
            <span className="font-medium text-foreground">{filtered.length}</span> events
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  totalPages > 5 &&
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(page - currentPage) > 1
                ) {
                  if (page === 2 || page === totalPages - 1) return <span key={page} className="text-muted-foreground px-1">...</span>;
                  return null;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 text-xs p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
