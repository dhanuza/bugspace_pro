import { createFileRoute } from "@tanstack/react-router";
import { OrgRegistrationForm } from "../components/admin/OrgRegistrationForm";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/organizations")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage tenant organisations on the platform.
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <OrgRegistrationForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
