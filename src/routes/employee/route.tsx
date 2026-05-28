import { Outlet, Link, createFileRoute,
} from "@tanstack/react-router";

export const Route = createFileRoute(
  "/employee"
)({
  component: EmployeeLayout,
});

function EmployeeLayout() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1120] text-white flex flex-col border-r border-slate-800">
        
        {/* LOGO */}
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-wide">
            <span className="text-white">
              Bugspace
            </span>

            <span className="text-purple-500">
              Pro
            </span>
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-2"> 

          {/* PROGRAMS */}
          <Link
            to="/employee/programs"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-purple-600 hover:text-white transition-all"
            activeProps={{
              className:
                "flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600 text-white shadow-lg",
            }}
          >
            {/* ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>

            <span className="font-medium">
              Programs
            </span>
          </Link>

          {/* REPORTS */}
          <Link
            to="/employee/reports"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-purple-600 hover:text-white transition-all"
            activeProps={{
              className:
                "flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600 text-white shadow-lg",
            }}
          >
            {/* ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-6h13v6M9 5v6h13V5M3 5h.01M3 12h.01M3 19h.01"
              />
            </svg>

            <span className="font-medium">
              Reports
            </span>
          </Link>

          {/* PROFILE */}
          <Link
            to="/employee/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-purple-600 hover:text-white transition-all"
            activeProps={{
              className:
                "flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600 text-white shadow-lg",
            }}
          >
            {/* ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 1118 20H6a1 1 0 01-.879-1.496z"
              />
            </svg>

            <span className="font-medium">
              Profile
            </span>
          </Link>
        </nav>

        {/* FOOTER */}
        <div className="px-6 py-5 border-t border-slate-800">
          <div className="bg-slate-900 rounded-2xl p-4">
            <p className="text-sm text-slate-400">
              Logged in as
            </p>

            <h3 className="font-semibold mt-1">
              Security Analyst
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              analyst@bugspace.com
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          
          {/* PAGE TITLE */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Employee Triage Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage assigned vulnerability reports
            </p>
          </div>

          {/* USER INFO */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h3 className="font-semibold text-gray-900">
                John
              </h3>

              <p className="text-sm text-gray-500">
                Security Analyst
              </p>
            </div>

            {/* AVATAR */}
            <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              A
            </div>
          </div>
        </header>

        {/* ROUTE CONTENT */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
