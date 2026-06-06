import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import axios from "axios"; // 1. Imported Axios for live network handshakes

import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  User,
} from "lucide-react";

import EmployeeStatCard from "@/components/EmployeeStatCard";

export const Route = createFileRoute("/_app/employee")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // 2. Swapped static mock reference with real-time state array
  const [reports, setReports] = useState<any[]>([]);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // 3. Added lifecycle synchronization with the backend server proxy
  useEffect(() => {
    async function fetchAssignedQueue() {
      try {
        const response = await axios.get(`${API_BASE}/api/reports`);
        if (response.data) {
          setReports(response.data);
        }
      } catch (err) {
        console.error("Failed fetching live reports via port 4000:", err);
      }
    }
    fetchAssignedQueue();
  }, [API_BASE]);

  const reportsPerPage = 3;

  // Uses live database array instead of hardcoded static parameters
  const filteredReports = reports.filter((report) =>
    report.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage) || 1;
  const startIndex = (currentPage - 1) * reportsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + reportsPerPage);

  // Dynamic counter aggregations based on live dataset states
  const criticalCount = reports.filter(r => r.severity === "Critical").length;
  const inReviewCount = reports.filter(r => r.status === "In Review" || r.status === "Needs Info").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved" || r.status === "Closed").length;

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-60 bg-[#050816] text-white flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center font-bold text-lg">
            B
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold leading-none">BugSpace</h1>
            <p className="text-xs text-gray-400 mt-1">Employee Portal</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/employee"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#7c3aed] text-white transition-all duration-200 shadow-sm"
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/employee"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <FileText size={20} />
            <span className="font-medium">Assigned Reports</span>
          </Link>

          <Link
            to="/employee"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <FolderKanban size={20} />
            <span className="font-medium">Programs</span>
          </Link>

          <Link
            to="/employee"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Frame */}
      <div className="flex-1">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden w-10 h-10 rounded-lg border flex items-center justify-center">
              ☰
            </button>
            <div>
              <h2 className="font-semibold text-lg text-[#0f172a]">Employee Dashboard</h2>
              <p className="hidden md:block text-sm text-gray-500">Security Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="font-medium text-[#0f172a]">John</p>
              <p className="text-sm text-gray-500">analyst@bugspace.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="p-4 md:p-6 space-y-6">
          <div className="inline-flex px-3 py-1 rounded-md bg-gray-100 text-sm font-medium text-gray-600">
            EMPLOYEE
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a]">Employee Overview</h1>
            <p className="text-gray-500 mt-2">
              Assigned reports, triage activity, and vulnerability workflow.
            </p>
          </div>

          {/* Stats Cards Displaying Dynamic Metric Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <EmployeeStatCard title="Assigned Reports" value={reports.length.toString()} />
            <EmployeeStatCard title="Open Reports" value={reports.filter(r => r.status !== 'Closed').length.toString()} />
            <EmployeeStatCard title="In Review" value={inReviewCount.toString()} />
            <EmployeeStatCard title="Resolved" value={resolvedCount.toString()} />
            <EmployeeStatCard title="Critical Reports" value={criticalCount.toString()} valueColor="text-red-600" />
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 rounded-xl border bg-white w-full md:w-72 outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
              <select className="px-4 py-3 rounded-xl border bg-white outline-none">
                <option>All Severity</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select className="px-4 py-3 rounded-xl border bg-white outline-none">
                <option>All Status</option>
                <option>New</option>
                <option>Triaged</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>
            <button className="px-5 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium">
              View All Reports
            </button>
          </div>

          {/* Reports Table Grid Section */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0f172a]">Assigned Reports</h2>
              <span className="text-sm text-gray-500">{filteredReports.length} reports</span>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Program</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Severity</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No active items found matching your filter scope.
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-[#0f172a]">
                          {report.title}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {report.programName || report.program || "Global Target Group"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            report.severity === "Critical" ? "bg-red-100 text-red-700" :
                            report.severity === "High" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {report.severity || "Medium"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            report.status === "Resolved" || report.status === "Closed" ? "bg-green-100 text-green-700" :
                            report.status === "Triaged" ? "bg-blue-100 text-blue-700" :
                            "bg-purple-100 text-purple-700"
                          }`}>
                            {report.status || "New"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {report.date || "Just Now"}
                        </td>
                        <td className="px-6 py-4">
                          {/* 4. Updated button to route cleanly into the dynamic Report Detail View */}
                          <Link 
                            to="/employee/reports/$reportId" 
                            params={{ reportId: report.id || "rep-01" }}
                          >
                            <button className="px-3 py-1 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition">
                              Review
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination controls footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                <p className="text-sm text-gray-500">
                  Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        currentPage === index + 1 ? "bg-[#7c3aed] text-white" : "border bg-white hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}