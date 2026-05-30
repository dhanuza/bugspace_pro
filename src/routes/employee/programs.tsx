<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/employee/programs")({
  component: ProgramsPage,
});

interface Program {
  id: string;
  name: string;
  organization: string;
  description: string;
  status: "Active" | "Disabled";
  severityScope: string;
  reportsCount: number;
  researchers: number;
  employees: number;
  recentReports: number;
}

const programs: Program[] = [
  {
    id: "1",
    name: "Real Bug",
    organization: "Bugspace",
    description: "Main web application testing",
    status: "Active",
    severityScope: "Low - Critical",
    reportsCount: 24,
    researchers: 5,
    employees: 3,
    recentReports: 7,
  },
  {
    id: "2",
    name: "Program 123",
    organization: "Google",
    description: "API testing scope",
    status: "Disabled",
    severityScope: "Medium - Critical",
    reportsCount: 10,
    researchers: 2,
    employees: 1,
    recentReports: 3,
  },
  {
    id: "3",
    name: "HackCaps",
    organization: "Microsoft",
    description: "Cloud security assessment",
    status: "Active",
    severityScope: "Low - High",
    reportsCount: 36,
    researchers: 8,
    employees: 4,
    recentReports: 12,
  },
];

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredPrograms = useMemo(() => {
    return programs
      .filter((program) => {
        const matchesSearch =
          program.name.toLowerCase().includes(search.toLowerCase()) ||
          program.organization
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
          status === "All" || program.status === status;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.reportsCount - a.reportsCount);
  }, [search, status]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Programs
          </h1>

          <p className="text-gray-500 mt-2">
            Manage vulnerability testing programs and scopes.
          </p>
        </div>

        <button className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-3 rounded-xl font-medium shadow">
          + Create Program
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search programs..."
            className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* PROGRAM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300"
          >
            {/* CARD TOP */}
            <div className="h-40 bg-gradient-to-r from-black via-purple-900 to-indigo-900 relative">
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    program.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {program.status}
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {program.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {program.organization}
                </p>
              </div>

              <p className="text-gray-600 text-sm leading-6 mb-5">
                {program.description}
              </p>

              {/* DETAILS */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Severity Scope
                  </span>

                  <span className="font-medium text-gray-900">
                    {program.severityScope}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Reports Count
                  </span>

                  <span className="font-semibold text-purple-700">
                    {program.reportsCount}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Researchers
                  </span>

                  <span className="font-medium">
                    {program.researchers}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Employees
                  </span>

                  <span className="font-medium">
                    {program.employees}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Recent Reports
                  </span>

                  <span className="font-medium">
                    {program.recentReports}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition">
                  View Program
                </button>

                <button className="flex-1 border border-gray-200 hover:bg-gray-100 py-3 rounded-xl font-medium transition">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredPrograms.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center mt-10">
          <h2 className="text-2xl font-bold text-gray-800">
            No Programs Found
          </h2>

          <p className="text-gray-500 mt-3">
            Try changing filters or search keywords.
          </p>
        </div>
      )}
=======
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute(
  "/employee/programs"
)({
  component: EmployeeProgramsPage,
});

/* -------------------------------- */
/* PROGRAM DATA                     */
/* -------------------------------- */

const programs = [
  {
    id: 1,
    name: "HackCaps",
    company: "Microsoft",
    description:
      "Cloud security assessment",
    severity: "Low - High",
    status: "Active",
    reports: 36,
    pending: 12,
    researchers: 8,
    scope: ["Web", "API"],
  },

  {
    id: 2,
    name: "Real Bug",
    company: "Bugspace",
    description:
      "Main web application testing",
    severity: "Low - Critical",
    status: "Active",
    reports: 24,
    pending: 7,
    researchers: 5,
    scope: ["Web", "Mobile", "API"],
  },

  {
    id: 3,
    name: "Program 123",
    company: "Google",
    description:
      "API testing scope",
    severity: "Medium - Critical",
    status: "Paused",
    reports: 10,
    pending: 3,
    researchers: 2,
    scope: ["API"],
  },
];

/* -------------------------------- */
/* STATUS COLORS                    */
/* -------------------------------- */

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";

    case "Paused":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-red-100 text-red-700";
  }
}

/* -------------------------------- */
/* COMPONENT                        */
/* -------------------------------- */

function EmployeeProgramsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        program.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        program.company
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All"
          ? true
          : program.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-5xl font-bold text-gray-900">
            Programs
          </h1>

          <p className="text-gray-500 mt-2 text-lg">
            Manage assigned vulnerability
            testing programs and scopes.
          </p>

        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white border rounded-3xl shadow-sm p-4 mb-10">

          <div className="flex flex-col md:flex-row gap-4">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 border rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* FILTER */}
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="border rounded-2xl px-5 py-4 w-full md:w-44 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>Active</option>
              <option>Paused</option>
            </select>

          </div>
        </div>

        {/* PROGRAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-lg transition-all"
            >

              {/* TOP BANNER */}
              <div className="h-40 bg-gradient-to-r from-black via-indigo-900 to-blue-700 relative">

                {/* STATUS BADGE */}
                <span
                  className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    program.status
                  )}`}
                >
                  {program.status}
                </span>

              </div>

              {/* CONTENT */}
              <div className="p-7">

                {/* TITLE */}
                <h2 className="text-4xl font-bold text-gray-900">
                  {program.name}
                </h2>

                <p className="text-gray-500 mt-1 text-lg">
                  {program.company}
                </p>

                {/* DESCRIPTION */}
                <p className="text-gray-600 mt-6 leading-relaxed">
                  {program.description}
                </p>

                {/* STATS */}
                <div className="mt-7 space-y-4">

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Severity Scope
                    </span>

                    <span className="font-semibold text-gray-800">
                      {program.severity}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Reports Count
                    </span>

                    <span className="font-semibold text-indigo-600">
                      {program.reports}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Pending Reports
                    </span>

                    <span className="font-semibold text-orange-600">
                      {program.pending}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Researchers
                    </span>

                    <span className="font-semibold text-gray-800">
                      {program.researchers}
                    </span>

                  </div>

                </div>

                {/* SCOPE TAGS */}
                <div className="mt-7">

                  <p className="text-sm text-gray-500 mb-3">
                    Scope
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {program.scope.map((item) => (
                      <span
                        key={item}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {item}
                      </span>
                    ))}

                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 mt-8">

                  <Link
                    to="/employee/programs/$programId"
                    params={{
                      programId: String(program.id),
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white py-3 rounded-2xl text-center font-semibold transition"
                  >
                    View Program
                  </Link>

                  <Link
                    to="/employee/reports"
                    className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 rounded-2xl text-center font-semibold transition"
                  >
                    Reports
                  </Link>

                </div>

              </div>
            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {filteredPrograms.length === 0 && (
          <div className="bg-white rounded-3xl border shadow-sm p-16 text-center mt-10">

            <h2 className="text-3xl font-bold text-gray-800">
              No Programs Found
            </h2>

            <p className="text-gray-500 mt-3">
              Try adjusting search or filter.
            </p>

          </div>
        )}

      </div>
>>>>>>> janani/main
    </div>
  );
}