// src/components/ReportDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ReportDetail() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Call backend API
    fetch(`http://localhost:5000/api/reports/${reportId}`)
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error("Error fetching report:", err));
  }, [reportId]);

  if (!report) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Detail</h2>

      <p><strong>Title:</strong> {report.title}</p>
      <p><strong>Severity:</strong> {report.severity}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Program:</strong> {report.program}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Description</h3>
        <p className="text-gray-700">{report.description}</p>
      </div>

      {report.attachments?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Attachments</h3>
          <ul className="list-disc pl-5">
            {report.attachments.map((file, idx) => (
              <li key={idx}>
                <a href={`/uploads/${file}`} className="text-blue-600 hover:underline">
                  {file}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.internalNote && (
        <div className="mt-4 bg-yellow-50 p-3 rounded">
          <h3 className="font-semibold">Internal Note</h3>
          <p className="text-gray-700">{report.internalNote}</p>
        </div>
      )}
    </div>
  );
}
