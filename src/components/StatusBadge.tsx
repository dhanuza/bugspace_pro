import type { ReportStatus } from "../types";
import { cn } from "../lib/utils";

const styles: Record<ReportStatus, string> = {
  New: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Needs Info": "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  Triaged: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Valid: "bg-green-500/15 text-green-300 border-green-500/30",
  Duplicate: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  Closed: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}