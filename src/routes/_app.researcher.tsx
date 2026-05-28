import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardCards } from "../components/DashboardCards";
import { ReportsTable } from "../components/ReportsTable";

export const Route = createFileRoute("/_app/researcher")({
  component: ResearcherDashboard,
});

function ResearcherDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Researcher Dashboard</h1>
          <p className="text-sm text-muted-foreground">Submit and track your findings</p>
        </div>
        <Link
          to="/reports/new"
          className="px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90"
        >
          + New Report
        </Link>
      </div>
      <DashboardCards />
      <ReportsTable />
    </div>
  );
}
