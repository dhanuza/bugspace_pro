import { createFileRoute } from "@tanstack/react-router";
import { ReportsTable } from "../components/ReportsTable";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <ReportsTable />
    </div>
  );
}
