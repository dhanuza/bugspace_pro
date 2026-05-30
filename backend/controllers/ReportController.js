// backend/controllers/ReportController.js
import { db } from "../firebase.js";

export const ReportController = {
  async list(req, res) {
    try {
      const snapshot = await db.collection("reports").get();
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const reportId = req.params.id;
      const doc = await db.collection("reports").doc(reportId).get();

      if (!doc.exists) return res.status(404).json({ error: "Report not found" });

      const report = doc.data();

      // Hide internal notes if toggle is OFF
      if (!report.internalNoteVisible) {
        delete report.internalNote;
      }

      res.json({ id: doc.id, ...report });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
