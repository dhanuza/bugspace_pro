import { Bug, ShieldCheck, Clock, AlertTriangle } from "lucide-react";

const cards = [
  { label: "Open Reports", value: 24, icon: Bug, accent: "text-primary" },
  { label: "Triaged", value: 12, icon: Clock, accent: "text-blue-400" },
  { label: "Valid", value: 38, icon: ShieldCheck, accent: "text-emerald-400" },
  { label: "Critical", value: 3, icon: AlertTriangle, accent: "text-destructive" },
];

export function DashboardCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <Icon className={`h-4 w-4 ${c.accent}`} />
            </div>
            <div className="text-2xl font-semibold mt-2">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
}
