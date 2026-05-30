import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/employee/reports/$reportId"
)({
  component: ReportDetailPage,
});

/* -------------------------------- */
/* MOCK REPORT DATA                 */
/* -------------------------------- */

const reports = [
  {
    id: "REP-101",
    title: "Session Fixation on admin.realbug.com",
    severity: "High",
    program: "real bug",
    researcher: "John Doe",
    submittedAt: "May 23, 2026",
    description:
      "Session fixation vulnerability allows attackers to hijack authenticated sessions.",
    impact:
      "Attacker can gain unauthorized access to user accounts.",
    endpoint: "/api/v1/session",
  },

  {
    id: "REP-102",
    title: "Authentication Bypass on *.google.com",
    severity: "Critical",
    program: "program123",
    researcher: "Alex Carter",
    submittedAt: "May 21, 2026",
    description:
      "Authentication bypass due to improper JWT validation.",
    impact:
      "Attacker can login without valid credentials.",
    endpoint: "/auth/login",
  },
];

/* -------------------------------- */
/* SEVERITY COLORS                  */
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

function ReportDetailPage() {
  const { reportId } = Route.useParams();

  const report = reports.find(
    (r) => r.id === reportId
  );

  const [status, setStatus] = useState("Triaged");

  const handleAssignToMe = () => {
    alert("Report assigned successfully");
  };

  const handleRequestInfo = () => {
    setStatus("Needs Info");
    alert("Requested more information");
  };

  const handleDuplicate = () => {
    setStatus("Duplicate");
    alert("Marked as duplicate");
  };

  const handleCloseReport = () => {
    setStatus("Closed");
    alert("Report closed");
  };

  const messages = [
    {
      id: 1,
      sender: "Researcher",
      text: "Found vulnerability in authentication flow.",
      time: "10:30 AM",
    },

    {
      id: 2,
      sender: "Employee",
      text: "Could you please provide a proof-of-concept video for further validation?",
      time: "10:45 AM",
    },
  ];

  const attachments = [
    "poc.png",
    "exploit-video.mp4",
    "payload.txt",
  ];

  if (!report) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl font-bold">
          Report Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* BACK BUTTON */}
      <button
        onClick={() => window.history.back()}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to Reports
      </button>

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

        <div className="flex justify-between items-start flex-wrap gap-6">

          <div>
            <h1 className="text-3xl font-bold">
              {report.title}
            </h1>

            <p className="text-gray-500 mt-1">
              #{report.id}
            </p>

            <div className="flex gap-3 mt-4 flex-wrap">

              {/* SEVERITY */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                  report.severity
                )}`}
              >
                {report.severity}
              </span>

              {/* CVSS */}
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                CVSS 8.8
              </span>

              {/* STATUS */}
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="border rounded-lg px-3 py-1"
              >
                <option>New</option>
                <option>Triaged</option>
                <option>Needs Info</option>
                <option>Duplicate</option>
                <option>Closed</option>
              </select>

            </div>
          </div>

          {/* RIGHT INFO */}
          <div className="text-right text-sm text-gray-600 space-y-1">

            <p>
              <span className="font-semibold">
                Program:
              </span>{" "}
              {report.program}
            </p>

            <p>
              <span className="font-semibold">
                Researcher:
              </span>{" "}
              {report.researcher}
            </p>

            <p>
              <span className="font-semibold">
                Assigned To:
              </span>{" "}
              John
            </p>

            <p>
              <span className="font-semibold">
                Submitted:
              </span>{" "}
              {report.submittedAt}
            </p>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-6">

          {/* DETAILS */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">

            <h2 className="text-xl font-semibold mb-4">
              Vulnerability Details
            </h2>

            <div className="space-y-5">

              <div>
                <h3 className="font-semibold mb-1">
                  Description
                </h3>

                <p className="text-gray-600">
                  {report.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  Steps to Reproduce
                </h3>

                <ol className="list-decimal pl-5 text-gray-600 space-y-1">
                  <li>Open target endpoint</li>
                  <li>Intercept request</li>
                  <li>Modify payload</li>
                  <li>Observe vulnerability execution</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  Impact
                </h3>

                <p className="text-gray-600">
                  {report.impact}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  Affected Endpoint
                </h3>

                <code className="bg-gray-100 px-2 py-1 rounded">
                  {report.endpoint}
                </code>
              </div>

            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">

            <h2 className="text-xl font-semibold mb-4">
              Attachments
            </h2>

            <div className="space-y-3">

              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-lg px-4 py-3"
                >

                  <span>
                    {file.endsWith(".png") && "🖼️ "}
                    {file.endsWith(".mp4") && "🎥 "}
                    {file.endsWith(".txt") && "📄 "}
                    {file}
                  </span>

                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    View
                  </button>

                </div>
              ))}

            </div>
          </div>

          {/* CHAT */}
          <div className="bg-[#0b141a] rounded-2xl shadow-sm border border-gray-800 overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#202c33] border-b border-gray-700">

              <div>
                <h2 className="text-white text-lg font-semibold">
                  Discussion Thread
                </h2>

                <p className="text-xs text-gray-400">
                  Secure vulnerability discussion
                </p>
              </div>

            </div>

            {/* MESSAGE AREA */}
            <div className="h-[500px] overflow-y-auto p-5 bg-[#0b141a] flex flex-col gap-4">

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "Employee"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl shadow ${
                      msg.sender === "Employee"
                        ? "bg-[#005c4b] text-white rounded-br-md"
                        : "bg-[#202c33] text-gray-100 rounded-bl-md"
                    }`}
                  >

                    <div className="flex justify-between items-center gap-4 mb-2">

                      <span className="text-sm font-semibold">
                        {msg.sender}
                      </span>

                      <span className="text-xs text-gray-300">
                        {msg.time}
                      </span>

                    </div>

                    <p className="leading-relaxed text-sm">
                      {msg.text}
                    </p>

                  </div>
                </div>
              ))}
            </div>

            {/* INPUT AREA */}
            <div className="bg-[#202c33] border-t border-gray-700 p-4">

              <div className="flex items-center gap-3">

                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 rounded-full px-5 py-3 outline-none"
                />

                <button className="bg-[#00a884] hover:bg-[#019875] text-white px-6 py-3 rounded-full font-medium transition">
                  Send
                </button>

              </div>

              <label className="flex items-center gap-2 text-sm mt-4 text-gray-400">
                <input type="checkbox" />
                Internal Note
              </label>

            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="space-y-6">

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">

            <h2 className="text-xl font-semibold mb-4">
              Quick Actions
            </h2>

            <div className="space-y-3">

              <button
                onClick={handleAssignToMe}
                className="w-full bg-blue-100 text-blue-700 py-3 rounded-xl"
              >
                Assign To Me
              </button>

              <button
                onClick={handleRequestInfo}
                className="w-full bg-yellow-100 text-yellow-700 py-3 rounded-xl"
              >
                Request More Info
              </button>

              <button
                onClick={handleDuplicate}
                className="w-full bg-purple-100 text-purple-700 py-3 rounded-xl"
              >
                Mark as Duplicate
              </button>

              <button
                onClick={handleCloseReport}
                className="w-full bg-green-100 text-green-700 py-3 rounded-xl"
              >
                Close Report
              </button>

            </div>
          </div>

          {/* ACTIVITY */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">

            <h2 className="text-xl font-semibold mb-4">
              Activity Timeline
            </h2>

            <div className="space-y-4 text-sm text-gray-600">

              <p>
                • Report submitted by researcher
              </p>

              <p>
                • Status changed to Triaged
              </p>

              <p>
                • Employee requested more information
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}