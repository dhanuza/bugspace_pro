/**
 * src/routes/unauthorized.tsx
 * 403 Unauthorized page — shown when a user is authenticated but lacks the required role.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldX } from "lucide-react";
import { useAuth } from "../store/auth";
import { getRoleDashboard } from "../lib/roleRedirect";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { appUser } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md text-center relative z-10">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 text-red-600 border-2 border-red-200">
            <ShieldX className="h-10 w-10" strokeWidth={2} />
          </span>
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-3">403</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Denied</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          You don't have permission to view this page.
          {appUser && (
            <span className="block mt-2">
              Your current role is <strong className="text-slate-900 capitalize">{appUser.role}</strong>.
            </span>
          )}
        </p>
        <Link
          to={appUser ? getRoleDashboard(appUser.role) : "/login"}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 shadow-lg shadow-slate-900/20"
        >
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}
