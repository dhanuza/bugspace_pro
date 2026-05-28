import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { programRepository } from "../repositories/ApiProgramRepository";
import type { Program } from "../types";

export const Route = createFileRoute("/_app/programs")({
  component: ProgramsPage,
});

const placeholder: Program[] = [
  { id: "p1", name: "Web App", scope: "*.app.bugspace.io", active: true, orgId: "org-1" },
  { id: "p2", name: "Mobile API", scope: "api.mobile.bugspace.io", active: true, orgId: "org-1" },
  { id: "p3", name: "Internal Tools", scope: "internal.bugspace.io", active: false, orgId: "org-1" },
];

function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  useEffect(() => {
    programRepository.list().then(setPrograms).catch(() => setPrograms(placeholder));
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Programs</h1>
        <button className="px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90 shrink-0">
          + New Program
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{p.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-md border ${p.active ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-muted text-muted-foreground border-border"}`}>
                {p.active ? "Active" : "Paused"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{p.scope}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
