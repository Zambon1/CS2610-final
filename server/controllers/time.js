import express from "express";
import {
  createTimeEntry,
  endBreak,
  endTimeEntry,
  getLaborerShiftEntries,
  getActiveTimeEntryByUserId,
  getPreviousShiftEntriesByUserId,
  getTimeEntryById,
  startBreak,
  switchTask,
} from "../models/time.js";
import { getTaskById } from "../models/tasks.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const SHIFT_DURATION_SECONDS = 8 * 60 * 60;

function getAction(req) {
  return (req.get("x-time-action") || "").toLowerCase();
}

function getTaskId(req) {
  const rawTaskId = req.get("x-task-id");
  if (!rawTaskId) {
    return null;
  }

  const parsed = Number.parseInt(rawTaskId, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

async function buildTimeState(userId) {
  const activeTime = await getActiveTimeEntryByUserId(userId);

  if (!activeTime) {
    return {
      activeTime: null,
      currentTask: null,
      shiftEndsAt: null,
      remainingSeconds: 0,
      isOnBreak: false,
    };
  }

  const currentTask = activeTime.task_id ? await getTaskById(activeTime.task_id) : null;
  const startedAt = new Date(activeTime.started_at).getTime();
  const shiftEndsAt = new Date(startedAt + SHIFT_DURATION_SECONDS * 1000).toISOString();
  const remainingSeconds = Math.max(0, Math.floor((new Date(shiftEndsAt).getTime() - Date.now()) / 1000));
  const isOnBreak = Boolean(activeTime.break_start && !activeTime.break_end);

  return {
    activeTime,
    currentTask,
    shiftEndsAt,
    remainingSeconds,
    isOnBreak,
  };
}

async function buildLaborerShiftEntries(user) {
  if (!user?.isSupervisor) {
    return [];
  }

  return getLaborerShiftEntries();
}

async function buildPreviousShiftEntries(userId) {
  return getPreviousShiftEntriesByUserId(userId);
}

async function buildTimePayload(user) {
  const [state, laborerShiftEntries, previousShiftEntries] = await Promise.all([
    buildTimeState(user.id),
    buildLaborerShiftEntries(user),
    buildPreviousShiftEntries(user.id),
  ]);

  return {
    ...state,
    laborerShiftEntries,
    previousShiftEntries,
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const payload = await buildTimePayload(req.user);
    res.json(payload);
  } catch (err) {
    console.error("Time state error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const action = getAction(req);
  const taskId = getTaskId(req);

  try {
    const activeTime = await getActiveTimeEntryByUserId(req.user.id);

    if (action === "clock-in") {
      if (activeTime) {
        return res.status(409).json({ error: "You are already clocked in." });
      }

      if (!taskId) {
        return res.status(400).json({ error: "A task is required to clock in." });
      }

      const task = await getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found." });
      }

      const timeEntry = await createTimeEntry(req.user.id, taskId);
      return res.status(201).json({ timeEntry, ...(await buildTimePayload(req.user)) });
    }

    if (!activeTime) {
      return res.status(404).json({ error: "No active timer found." });
    }

    if (action === "clock-out") {
      const timeEntry = await endTimeEntry(activeTime.id);
      return res.json({ timeEntry, ...(await buildTimePayload(req.user)) });
    }

    if (action === "start-break") {
      if (activeTime.break_start && !activeTime.break_end) {
        return res.status(409).json({ error: "You are already on break." });
      }

      const timeEntry = await startBreak(activeTime.id);
      return res.json({ timeEntry, ...(await buildTimePayload(req.user)) });
    }

    if (action === "end-break") {
      if (!activeTime.break_start || activeTime.break_end) {
        return res.status(409).json({ error: "You are not currently on break." });
      }

      const timeEntry = await endBreak(activeTime.id);
      return res.json({ timeEntry, ...(await buildTimePayload(req.user)) });
    }

    if (action === "switch-task") {
      if (!taskId) {
        return res.status(400).json({ error: "A task is required to switch tasks." });
      }

      const task = await getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found." });
      }

      const timeEntry = await switchTask(activeTime.id, taskId);
      return res.json({ timeEntry, ...(await buildTimePayload(req.user)) });
    }

    return res.status(400).json({ error: "Unsupported time action." });
  } catch (err) {
    console.error("Time action error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;