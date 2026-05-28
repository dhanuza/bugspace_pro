import { createFileRoute } from "@tanstack/react-router";
import { DashboardCards } from "../components/DashboardCards";
import { ReportsTable } from "../components/ReportsTable";

export const Route = createFileRoute("/_app/manager")({
  component: ManagerDashboard,
});

function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground">Triage and assign reports</p>
      </div>
      <DashboardCards />
      <ReportsTable />
    </div>
  );
}
