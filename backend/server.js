// backend/server.js
import express from "express";
import cors from "cors";
import reportsRouter from "./routes/reports.js";
import employeesRouter from "./routes/employees.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/reports", reportsRouter);
app.use("/api/employees", employeesRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
