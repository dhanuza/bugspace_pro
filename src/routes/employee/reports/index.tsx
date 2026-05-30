import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute(
  "/employee/reports/"
)({
  component: EmployeeReportsPage,
});

type ReportStatus =
  | "New"
  | "Triaged"
  | "Resolved"
  | "Duplicate"
  | "Invalid";

interface Report {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  program: string;
  status: ReportStatus;
  submittedAt: string;
}

/* -------------------------------- */
/* EMPLOYEE ASSIGNED PROGRAMS ONLY  */
/* -------------------------------- */

const employeeAssignedPrograms = [
  "real bug",
  "hackcaps",
];

/* -------------------------------- */
/* ALL REPORTS IN SYSTEM            */
/* -------------------------------- */

const allReports: Report[] = [
  {
    id: "REP-101",
    title: "Session Fixation on admin.realbug.com",
    severity: "High",
    program: "real bug",
    status: "New",
    submittedAt: "5/18/2026",
  },
  {
    id: "REP-102",
    title: "Authentication Bypass on *.google.com",
    severity: "Critical",
    program: "program123",
    status: "New",
    submittedAt: "5/18/2026",
  },
  {
    id: "REP-103",
    title: "Stored XSS in dashboard comments",
    severity: "Medium",
    program: "hackcaps",
    status: "Triaged",
    submittedAt: "5/17/2026",
  },
  {
    id: "REP-104",
    title: "Rate Limit Bypass in API Gateway",
    severity: "Low",
    program: "hackcaps",
    status: "Resolved",
    submittedAt: "5/15/2026",
  },
];

/* -------------------------------- */
/* BADGE COLORS                     */
/* -------------------------------- */

function getSeverityColor(severity: string) {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-700";

    case "High":
      return "bg-orange-100 text-orange-700";

    case "Medium":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-green-100 text-green-700";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-700";

    case "Triaged":
      return "bg-purple-100 text-purple-700";

    case "Resolved":
      return "bg-green-100 text-green-700";

    case "Duplicate":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function EmployeeReportsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  /* -------------------------------- */
  /* ONLY ASSIGNED PROGRAM REPORTS    */
  /* -------------------------------- */

  const employeeReports = useMemo(() => {
    return allReports.filter((report) =>
      employeeAssignedPrograms.includes(
        report.program.toLowerCase()
      )
    );
  }, []);

  /* -------------------------------- */
  /* SEARCH + FILTER                  */
  /* -------------------------------- */

  const filteredReports = useMemo(() => {
    return employeeReports.filter((report) => {
      const matchesSearch =
        report.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        report.program
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || report.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [employeeReports, search, filter]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Reports
        </h1>

        <p className="text-gray-500 mt-2">
          Review vulnerability reports submitted by
          researchers.
        </p>
      </div>

      {/* SEARCH + FILTER SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* SEARCH BAR */}
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search reports or researchers..."
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {/* SEARCH ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400 absolute left-4 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              "All",
              "New",
              "Triaged",
              "Resolved",
              "Duplicate",
              "Invalid",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? "bg-white border border-gray-300 text-gray-900 shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* TABLE HEADER */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Report
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Severity
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Program
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Submitted
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* REPORT */}
                  <td className="px-6 py-5">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {report.title}
                      </h2>

                      <p className="text-xs text-purple-600 mt-1">
                        #{report.id}
                      </p>
                    </div>
                  </td>

                  {/* SEVERITY */}
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                  </td>

                  {/* PROGRAM */}
                  <td className="px-6 py-5 capitalize text-gray-700">
                    {report.program}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-5 text-sm text-gray-500"> {report.submittedAt}</td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5">
                    <Link
                      to="/employee/reports/$reportId"
                      params={{ reportId: report.id }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition inline-block"
                    >
                      Review
                    </Link>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              No Reports Found
            </h2>

            <p className="text-gray-500 mt-3">
              No reports are assigned to your
              programs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}