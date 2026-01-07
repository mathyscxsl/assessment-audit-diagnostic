import { Request, Response } from "express";
import dashboardService from "../services/DashboardService";
import logger from "../config/logger";

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const summary = await dashboardService.getSummary();
      res.json(summary);
    } catch (error) {
      res.locals.errorMessage = (error as any)?.message ?? undefined;
      logger.error({ err: error }, "Get dashboard summary error");
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new DashboardController();
