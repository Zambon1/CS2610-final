import express from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  getProjectWithOpenTasksById,
  updateProject,
} from "../models/projects.js";
import { createTask, getActiveTasks } from "../models/tasks.js";
import { requireAuth, requireSupervisor } from "../middleware/auth.js";

const router = express.Router();

function parseOptionalDate(value) {
  if (!value) {
    return null;
  }

  return value;
}

function normalizeProjectPayload(body) {
  const name = body.name?.trim();
  const description = body.description?.trim() || "";
  const location = body.location?.trim() || "";
  const estimatedCompletionDate = parseOptionalDate(body.estimatedCompletionDate);

  return {
    name,
    description,
    location,
    estimatedCompletionDate,
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const projects = await getAllProjects();
    const tasks = await getActiveTasks();

    const projectSummaries = projects.map((project) => ({
      ...project,
      tasks: tasks.filter((task) => task.project_id === project.id),
    }));

    res.json({ projects: projectSummaries });
  } catch (err) {
    console.error("Project list error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const project = await getProjectWithOpenTasksById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({ project });
  } catch (err) {
    console.error("Project detail error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/", requireSupervisor, async (req, res) => {
  const payload = normalizeProjectPayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ error: "Project name is required." });
  }

  try {
    const project = await createProject(
      payload.name,
      payload.description,
      payload.location,
      req.user.id,
      payload.estimatedCompletionDate
    );
    res.status(201).json({ project });
  } catch (err) {
    console.error("Project create error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/:id", requireSupervisor, async (req, res) => {
  const payload = normalizeProjectPayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ error: "Project name is required." });
  }

  try {
    const existingProject = await getProjectById(req.params.id);

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found." });
    }

    const project = await updateProject(
      req.params.id,
      payload.name,
      payload.description,
      payload.location,
      req.user.id,
      payload.estimatedCompletionDate
    );

    res.json({ project });
  } catch (err) {
    console.error("Project update error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/:id/tasks", requireSupervisor, async (req, res) => {
  const name = req.body.name?.trim();
  const description = req.body.description?.trim() || "";

  if (!name) {
    return res.status(400).json({ error: "Task name is required." });
  }

  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const task = await createTask(name, description, req.params.id);
    res.status(201).json({ task });
  } catch (err) {
    console.error("Project task create error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.delete("/:id", requireSupervisor, async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    await deleteProject(req.params.id);
    res.json({ message: "Project deleted." });
  } catch (err) {
    console.error("Project delete error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;