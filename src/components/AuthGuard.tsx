/**
 * AuthGuard — protects pages that require authentication.
 *
 * Render this as a wrapper inside any route that needs a logged-in user.
 * It handles three states:
 *
 *  1. loading  → show a spinner (waiting for Firebase to resolve on mount)
 *  2. no user  → redirect to /login
 *  3. wrong role → redirect to /login (role-based guard)
 *
 * Usage:
 *   <AuthGuard allowedRoles={["admin", "manager"]}>
 *     <ProtectedPage />
 *   </AuthGuard>
 */

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/store/auth";
import type { Role } from "@/types";

interface AuthGuardProps {
children: React.ReactNode;
/** If provided, the user's role must be in this list. */
allowedRoles?: Role[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
const { appUser, loading } = useAuth();
const navigate = useNavigate();

useEffect(() => {
if (loading) return;
if (!appUser) {
navigate({ to: "/login" });
return;
}
if (allowedRoles && !allowedRoles.includes(appUser.role)) {
// User is authenticated but not authorized for this section.
// Redirect them to their own dashboard.
navigate({ to: /${appUser.role} as any });
}
}, [appUser, loading, allowedRoles, navigate]);

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center bg-background">
<div className="flex flex-col items-center gap-3">
<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
<p className="text-sm text-muted-foreground">Loading…</p>
</div>
</div>
);
}

if (!appUser) { 
  return <>{children}</>
}
if (allowedRoles && !allowedRoles.includes(appUser.role)) return null;

return <>{children}</>;
}