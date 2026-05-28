/**
 * RoleBadge — coloured pill showing a user's role.
 */
import type { Role } from "../../types";
import { cn } from "../../lib/utils";

const roleStyles: Record<Role, string> = {
  admin:      "bg-violet-500/15 text-violet-300 border-violet-500/30",
  manager:    "bg-blue-500/15  text-blue-300   border-blue-500/30",
  researcher: "bg-amber-500/15 text-amber-300  border-amber-500/30",
  employee:   "bg-slate-500/15 text-slate-300  border-slate-500/30",
};

const roleLabels: Record<Role, string> = {
  admin:      "Admin",
  manager:    "Manager",
  researcher: "Researcher",
  employee:   "Employee",
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        roleStyles[role],
        className,
      )}
    >
      {roleLabels[role]}
    </span>
  );
}
