/**
 * Role-based redirect utility.
 *
 * Returns the canonical dashboard path for a given role.
 * Use this wherever a redirect-after-login is needed so the logic
 * lives in one place and is easy to change.
 */
import type { Role } from "../types";

export const ROLE_DASHBOARD: Record<Role, string> = {
  admin: "/admin",
  manager: "/manager",
  researcher: "/researcher",
  employee: "/employee",
};

/**
 * Returns the home path for a role.
 * Falls back to "/login" if the role is unrecognised.
 */
export function getRoleDashboard(role: Role | undefined | null): string {
  if (!role) return "/login";
  return ROLE_DASHBOARD[role] ?? "/login";
}

/**
 * Returns true if the given role is allowed to access a route
 * restricted to `allowedRoles`.
 */
export function isRoleAllowed(
  role: Role | undefined | null,
  allowedRoles: Role[],
): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}
