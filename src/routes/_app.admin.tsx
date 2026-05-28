import { createFileRoute } from "@tanstack/react-router";
import { OverviewStats } from "../components/admin/OverviewStats";
import { OrganizationManagement } from "../components/admin/OrganizationManagement";
import { UserManagementTable } from "../components/admin/UserManagementTable";
import { AuditLogViewer } from "../components/admin/AuditLogViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Shield, Users, Building2, Clock, FileText, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage organizations, users, and monitor platform activity
        </p>
      </div>

      {/* Overview Statistics */}
      <OverviewStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <TabsList className="grid grid-cols-3 min-w-[300px] sm:min-w-0 sm:w-full lg:w-auto">
            <TabsTrigger value="users" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="organizations" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Organizations</span>
              <span className="sm:hidden">Orgs</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Audit Logs</span>
              <span className="sm:hidden">Audit</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">User Management</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all platform users
            </p>
          </div>
          <UserManagementTable />
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
