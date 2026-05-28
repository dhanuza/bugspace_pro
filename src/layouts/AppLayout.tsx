import { Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Loader2, ShieldAlert, LogOut, Menu, X } from "lucide-react";
import type { Role } from "../types";

const navByRole: Record<Role, { to: string; label: string }[]> = {
  admin: [
    { to: "/admin",         label: "Dashboard"     },
    { to: "/programs",      label: "Programs"      },
    { to: "/reports",       label: "Reports"       },
    { to: "/users",         label: "Users"         },
    { to: "/organizations", label: "Organizations" },
    { to: "/audit-logs",    label: "Audit Logs"    },
  ],
  manager: [
    { to: "/manager",    label: "Dashboard" },
    { to: "/programs",   label: "Programs"  },
    { to: "/reports",    label: "Reports"   },
    { to: "/users",      label: "Users"     },
    { to: "/audit-logs", label: "Audit Logs"},
  ],
  researcher: [
    { to: "/researcher",  label: "Dashboard" },
    { to: "/reports",     label: "Reports"   },
    { to: "/reports/new", label: "Submit"    },
  ],
  employee: [
    { to: "/employee", label: "Dashboard" },
    { to: "/reports",  label: "Reports"   },
  ],
};

export function AppLayout() {
  const { appUser, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //useEffect(() => {
    //if (!loading && !appUser) navigate({ to: "/login" });
  //}, [appUser, loading, navigate]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="p-8">
        <Outlet />
      </div>
    );
  }

  const items = navByRole[appUser.role];

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-20 rounded-full"></div>
            <ShieldAlert className="h-7 w-7 text-purple-400 relative" strokeWidth={2.5} />
          </div>
          <div className="text-xl font-bold tracking-tight">
            <span className="text-white">Bugspace</span>
            <span className="text-purple-400">Pro</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              location.pathname === it.to
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </>
  );
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 p-6 flex-col gap-6 shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wide">
              {appUser.role}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-900 truncate max-w-[160px]">{appUser.name}</div>
              <div className="text-xs text-slate-500 truncate max-w-[160px]">{appUser.email}</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}