import React, { useState } from "react";

const EmployeeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <h2 className="text-2xl font-bold p-4">Employee Dashboard</h2>
        <nav className="flex flex-col gap-2 p-4">
          <button
            className={`p-2 rounded ${activeTab === "programs" ? "bg-blue-700" : ""}`}
            onClick={() => setActiveTab("programs")}
          >
            Programs
          </button>
          <button
            className={`p-2 rounded ${activeTab === "reports" ? "bg-blue-700" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          <button
            className={`p-2 rounded ${activeTab === "profile" ? "bg-blue-700" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Profile */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="bg-white shadow rounded p-4 mb-4">
              <h3 className="font-semibold">Employee Info</h3>
              <p>Name: John Doe</p>
              <p>Email: john.doe@example.com</p>
              <p>Role: Security Analyst</p>
            </div>
            <div className="bg-white shadow rounded p-4 mb-4">
              <h3 className="font-semibold">Work Stats</h3>
              <p>Reports Submitted: 12</p>
              <p>Programs Joined: 3</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h3 className="font-semibold">Activity Log</h3>
              <ul className="list-disc pl-6">
                <li>Submitted report on May 20</li>
                <li>Joined program “Bug Bounty Alpha”</li>
              </ul>
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Reports</h2>
            <table className="w-full bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Report ID</th>
                  <th className="p-2">Severity</th>
                  <th className="p-2">Program</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">RPT-001</td>
                  <td className="p-2">High</td>
                  <td className="p-2">Bug Bounty Alpha</td>
                  <td className="p-2">Triaged</td>
                  <td className="p-2">May 15, 2026</td>
                </tr>
                <tr>
                  <td className="p-2">RPT-002</td>
                  <td className="p-2">Medium</td>
                  <td className="p-2">Bug Bounty Beta</td>
                  <td className="p-2">Resolved</td>
                  <td className="p-2">May 18, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Programs */}
        {activeTab === "programs" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">Bug Bounty Alpha</h3>
                <p>Active since Jan 2026</p>
                <p>Reports Submitted: 8</p>
              </div>
              <div className="bg-white shadow rounded p-4">
                <h3 className="font-semibold">Bug Bounty Beta</h3>
                <p>Active since Mar 2026</p>
                <p>Reports Submitted: 4</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
