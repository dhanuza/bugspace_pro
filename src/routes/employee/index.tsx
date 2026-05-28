import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  User,
} from "lucide-react";

import EmployeeStatCard from "@/components/EmployeeStatCard";
import { mockEmployeeReports } from "@/mocks/mockEmployeeReports";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

function EmployeeDashboard() {

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const reportsPerPage = 3;

  const filteredReports = mockEmployeeReports.filter((report) =>
    report.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredReports.length / reportsPerPage
  );

  const startIndex = (currentPage - 1) * reportsPerPage;

  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + reportsPerPage
  );

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] overflow-hidden">

      

      {/* Main Content */}
      <div className="flex-1">

        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">

          {/* Left */}
          <div className="flex items-center gap-3">

            <button className="md:hidden w-10 h-10 rounded-lg border flex items-center justify-center">
              ☰
            </button>

            <div>

              <h2 className="font-semibold text-lg text-[#0f172a]">
                Employee Dashboard
              </h2>

              <p className="hidden md:block text-sm text-gray-500">
                Security Operations Center
              </p>

            </div>

          </div>

          {/* Right */}
          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">

              <p className="font-medium text-[#0f172a]">
                Employee
              </p>

              <p className="text-sm text-gray-500">
                employee@bugspace.com
              </p>

            </div>

            <div className="w-10 h-10 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-semibold">
              E
            </div>

          </div>

        </header>

        {/* Content */}
        <main className="p-4 md:p-6 space-y-6">

          {/* Badge */}
          <div className="inline-flex px-3 py-1 rounded-md bg-gray-100 text-sm font-medium text-gray-600">
            EMPLOYEE
          </div>

          {/* Heading */}
          <div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a]">
              Employee Overview
            </h1>

            <p className="text-gray-500 mt-2">
              Assigned reports, triage activity, and vulnerability workflow.
            </p>

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            <EmployeeStatCard
              title="Assigned Reports"
              value="24"
            />

            <EmployeeStatCard
              title="Open Reports"
              value="10"
            />

            <EmployeeStatCard
              title="In Review"
              value="7"
            />

            <EmployeeStatCard
              title="Resolved"
              value="15"
            />

            <EmployeeStatCard
              title="Critical Reports"
              value="3"
              valueColor="text-red-600"
            />

          </div>

          {/* Search + Filters */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

            <div className="flex flex-col md:flex-row gap-3">

              {/* Search */}
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

              {/* Severity Filter */}
              <select className="px-4 py-3 rounded-xl border bg-white outline-none">
                <option>All Severity</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              {/* Status Filter */}
              <select className="px-4 py-3 rounded-xl border bg-white outline-none">
                <option>All Status</option>
                <option>New</option>
                <option>Triaged</option>
                <option>Resolved</option>
                <option>Rejected</option>
              </select>

            </div>

            {/* Button */}
            <button className="px-5 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium">
              View All Reports
            </button>

          </div>

          {/* Reports Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">

            {/* Table Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">

              <h2 className="text-lg font-semibold text-[#0f172a]">
                Assigned Reports
              </h2>

              <span className="text-sm text-gray-500">
                {filteredReports.length} reports
              </span>

            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin">

              <table className="w-full">

                <thead className="bg-gray-50 border-b">

                  <tr className="text-left">

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Title
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Program
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Severity
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedReports.map((report) => (

                    <tr
                      key={report.id}
                      className="border-b hover:bg-gray-50 transition"
                    >

                      <td className="px-6 py-4 font-medium">

                        <Link
                          to="/employee/reports"
                          className="text-[#0f172a] hover:text-[#7c3aed]"
                        >
                          {report.title}
                        </Link>

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {report.program}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium
                          ${
                            report.severity === "Critical"
                              ? "bg-red-100 text-red-700"
                              : report.severity === "High"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {report.severity}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium
                          ${
                            report.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : report.status === "Triaged"
                              ? "bg-blue-100 text-blue-700"
                              : report.status === "In Review"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {report.status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {report.date}
                      </td>

                      <td className="px-6 py-4">

                        <button className="px-3 py-1 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition">
                          Review
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-white">

                <p className="text-sm text-gray-500">
                  Showing page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">

                  {/* Previous */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => (

                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition
                      ${
                        currentPage === index + 1
                          ? "bg-[#7c3aed] text-white"
                          : "border bg-white hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>

                  ))}

                  {/* Next */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* Recent Activity + Program Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Activity */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-lg font-semibold text-[#0f172a]">
                  Recent Activity
                </h2>

                <button className="text-sm text-[#7c3aed] font-medium">
                  View All
                </button>

              </div>

              <div className="space-y-5">

                <div className="flex gap-4">

                  <div className="w-3 h-3 rounded-full bg-[#7c3aed] mt-2"></div>

                  <div>

                    <p className="font-medium text-[#0f172a]">
                      Status updated to Triaged
                    </p>

                    <p className="text-sm text-gray-500">
                      SQL Injection in Login API
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      2 hours ago
                    </p>

                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

                  <div>

                    <p className="font-medium text-[#0f172a]">
                      Report marked as Resolved
                    </p>

                    <p className="text-sm text-gray-500">
                      CSRF Issue in Payments
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Yesterday
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Program Access */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-lg font-semibold text-[#0f172a]">
                  Program Access
                </h2>

                <button className="text-sm text-[#7c3aed] font-medium">
                  View Programs
                </button>

              </div>

              <div className="space-y-4">

                <div className="border rounded-xl p-4 hover:bg-gray-50">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-semibold text-[#0f172a]">
                        Bug Bounty Program
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        12 assigned reports
                      </p>

                    </div>

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      Active
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
