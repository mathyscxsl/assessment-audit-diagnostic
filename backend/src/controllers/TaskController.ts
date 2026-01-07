import { Request, Response } from "express";
import taskService from "../services/TaskService";
import { TaskStatus } from "../models/Task";
import logger from "../config/logger";

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const { status, search } = req.query;

      const filters: any = {};

      if (status) {
        filters.status = status as TaskStatus;
      }

      if (search) {
        filters.search = search as string;
      }

      const tasks = await taskService.getTasks(filters);
      res.json(tasks);
    } catch (error) {
      res.locals.errorMessage = (error as any)?.message ?? undefined;
      logger.error({ err: error }, "Get tasks error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const { name, description, status } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Task name is required" });
      }

      if (name.length > 200) {
        return res.status(400).json({ error: "Task name is too long" });
      }

      // Validation du statut
      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // On utilise un user_id hardcodé pour simplifier (pas de vraie auth)
      const task = await taskService.createTask({
        user_id: 1,
        name: name.trim(),
        description: description || "",
        status: status || "todo",
      });

      res.status(201).json(task);
    } catch (error) {
      res.locals.errorMessage = (error as any)?.message ?? undefined;
      logger.error({ err: error }, "Create task error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const task = await taskService.updateTaskStatus(parseInt(id), status);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      res.locals.errorMessage = (error as any)?.message ?? undefined;
      logger.error({ err: error }, "Update task status error");
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async startTimer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.startTaskTimer(parseInt(id));
      res.json(task);
    } catch (error: any) {
      res.locals.errorMessage = error?.message ?? undefined;
      logger.error({ err: error }, "Start timer error");
      if (error.message === "Task not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Timer already running") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async stopTimer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.stopTaskTimer(parseInt(id));
      res.json(task);
    } catch (error: any) {
      res.locals.errorMessage = error?.message ?? undefined;
      logger.error({ err: error }, "Stop timer error");
      if (error.message === "Task not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Timer not running") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new TaskController();
