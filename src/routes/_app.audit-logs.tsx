import { createFileRoute } from "@tanstack/react-router";
import { AuditLogViewer } from "../components/admin/AuditLogViewer";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_app/audit-logs")({
  component: AuditLogsPage,
});

function AuditLogsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">
              Immutable record of all system events within your organisation.
            </p>
          </div>
        </div>
        <AuditLogViewer />
      </div>
    </ProtectedRoute>
  );
}
