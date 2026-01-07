import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";
import { requestLogger, errorCaptureMiddleware } from "./middleware/requestLogger";
import logger from "./config/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de base
app.use(cors());
app.use(express.json());
// Logging des requêtes
app.use(requestLogger);

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/dashboard", dashboardRoutes);

// Middleware de capture d'erreurs (après les routes)
app.use(errorCaptureMiddleware);

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server is running");
});

export default app;
