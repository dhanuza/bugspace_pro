import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { reportRepository } from "../repositories/ApiReportRepository";
import type { Severity } from "../types";

export const Route = createFileRoute("/_app/reports/new")({
  component: NewReportPage,
});

function NewReportPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [programId, setProgramId] = useState("p1");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [description, setDescription] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportRepository.create({ title, programId, severity, description });
    } catch {}
    navigate({ to: "/reports" });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Submit Vulnerability</h1>
      <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div>
          <label className="text-sm text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Program</label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="p1">Web App</option>
              <option value="p2">Mobile API</option>
              <option value="p3">Internal Tools</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
            className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90">
          Submit Report
        </button>
      </form>
    </div>
  );
}
