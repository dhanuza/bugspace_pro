import { createFileRoute } from "@tanstack/react-router";
import { UserManagementTable } from "../components/admin/UserManagementTable";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage user roles and access within your organisation.
            </p>
          </div>
        </div>
        <UserManagementTable />
      </div>
    </ProtectedRoute>
  );
}
