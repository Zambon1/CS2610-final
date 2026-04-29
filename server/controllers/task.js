import express from "express";
import {
  createTask,
  deleteTask,
  getActiveTasks,
  getAllTasks,
  getTaskById,
  updateTask,
} from "../models/tasks.js";
import { requireAuth, requireSupervisor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const tasks = req.query.all === "true" ? await getAllTasks() : await getActiveTasks();
    res.json({ tasks });
  } catch (err) {
    console.error("Task list error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/", requireSupervisor, async (req, res) => {
  const { id, name, description = "", completed = false, projectId = null } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Task name is required." });
  }

  try {
    if (id) {
      const existingTask = await getTaskById(id);
      if (!existingTask) {
        return res.status(404).json({ error: "Task not found." });
      }

      const task = await updateTask(id, name.trim(), description, Boolean(completed));
      return res.json({ task });
    }

    const task = await createTask(name.trim(), description, projectId);
    return res.status(201).json({ task });
  } catch (err) {
    console.error("Task save error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.delete("/:id", requireSupervisor, async (req, res) => {
  try {
    const existingTask = await getTaskById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    await deleteTask(req.params.id);
    res.json({ message: "Task deleted." });
  } catch (err) {
    console.error("Task delete error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;