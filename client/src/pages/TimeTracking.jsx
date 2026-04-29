import { useEffect, useState } from "react";
import { useRequireUser } from "../hooks/useRequireUser";
import CountdownTimer from "../components/CountdownTimer";

function TimeTracking() {
  const user = useRequireUser();
  const [tasks, setTasks] = useState([]);
  const [timeState, setTimeState] = useState(null);
  const [previousShiftEntries, setPreviousShiftEntries] = useState([]);
  const [laborerShiftEntries, setLaborerShiftEntries] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(String(tasks[0].id));
    }
  }, [tasks, selectedTaskId]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [timeRes, taskRes] = await Promise.all([
          fetch("/api/time"),
          fetch("/api/task"),
        ]);
        const [timeData, taskData] = await Promise.all([timeRes.json(), taskRes.json()]);

        if (cancelled) {
          return;
        }

        if (!timeRes.ok) {
          throw new Error(timeData.error || "Unable to load time data.");
        }

        if (!taskRes.ok) {
          throw new Error(taskData.error || "Unable to load tasks.");
        }

        setTimeState(timeData);
        setPreviousShiftEntries(timeData.previousShiftEntries || []);
        setLaborerShiftEntries(timeData.laborerShiftEntries || []);
        setTasks(taskData.tasks || []);

        if (timeData.currentTask?.id) {
          setSelectedTaskId(String(timeData.currentTask.id));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (user) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  async function runAction(action, taskId = selectedTaskId) {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-time-action": action,
          ...(taskId ? { "x-task-id": taskId } : {}),
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to update timer.");
      }

      setTimeState({
        activeTime: data.activeTime,
        currentTask: data.currentTask,
        shiftEndsAt: data.shiftEndsAt,
        remainingSeconds: data.remainingSeconds,
        isOnBreak: data.isOnBreak,
      });
      if (Array.isArray(data.laborerShiftEntries)) {
        setLaborerShiftEntries(data.laborerShiftEntries);
      }
      if (Array.isArray(data.previousShiftEntries)) {
        setPreviousShiftEntries(data.previousShiftEntries);
      }

      if (data.currentTask?.id) {
        setSelectedTaskId(String(data.currentTask.id));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const isActive = Boolean(timeState?.activeTime);
  const isOnBreak = Boolean(timeState?.isOnBreak);

  function formatTimeEntryDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <section className="time-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Time tracking</p>
          <h1>Track your shift</h1>
          <p className="page-copy">
            Clock in, pause for lunch, switch tasks, and clock out when you finish.
          </p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="time-layout">
        <section className="detail-card time-summary-card">
          <div className="section-heading">
            <h2>Current timer</h2>
            <p>The countdown stops when the shift ends.</p>
          </div>
          {loading ? (
            <p className="info-message">Loading timer...</p>
          ) : isActive ? (
            <>
              <CountdownTimer targetTimestamp={timeState.shiftEndsAt} label="Shift countdown" />
              <p className="home-task-line">
                Current task: <strong>{timeState.currentTask?.name || "Unassigned"}</strong>
              </p>
              <p className="home-task-line">
                Status: <strong>{isOnBreak ? "On break" : "Working"}</strong>
              </p>
            </>
          ) : (
            <p className="info-message">You are not clocked in yet.</p>
          )}
        </section>

        <section className="detail-card time-actions-card">
          <div className="section-heading">
            <h2>Actions</h2>
            <p>Choose a task before clocking in or switching tasks.</p>
          </div>

          <div className="form-group">
            <label htmlFor="task-select">Task</label>
            <select
              id="task-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={saving || loading}
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>

          <div className="action-group">
            {!isActive ? (
              <button
                className="btn btn-primary"
                disabled={!selectedTaskId || saving}
                onClick={() => runAction("clock-in")}
              >
                {saving ? "Saving..." : "Clock in"}
              </button>
            ) : (
              <>
                {!isOnBreak ? (
                  <button
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={() => runAction("start-break")}
                  >
                    Start lunch break
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={() => runAction("end-break")}
                  >
                    End lunch break
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  disabled={!selectedTaskId || saving}
                  onClick={() => runAction("switch-task")}
                >
                  Switch task
                </button>
                <button
                  className="btn btn-danger"
                  disabled={saving}
                  onClick={() => runAction("clock-out", "")}
                >
                  Clock out
                </button>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="detail-card time-history-card">
        <div className="section-heading">
          <h2>Your past shifts</h2>
        </div>
        {previousShiftEntries.length ? (
          <div className="task-list">
            {previousShiftEntries.map((entry) => (
              <article className="task-item" key={entry.id}>
                <div>
                  <h3>{entry.task_name || "Unassigned task"}</h3>
                  <p>
                    Clocked in: {formatTimeEntryDate(entry.started_at)} | Break start: {formatTimeEntryDate(entry.break_start)}
                  </p>
                  <p>
                    Clocked out: {formatTimeEntryDate(entry.ended_at)} | Break end: {entry.break_end ? formatTimeEntryDate(entry.break_end) : "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="info-message">No previous shifts found yet.</p>
        )}
      </section>

      {user.isSupervisor && (
        <section className="detail-card">
          <div className="section-heading">
            <h2>Laborer shifts</h2>
          </div>
          {laborerShiftEntries.length ? (
            <div className="task-list">
              {laborerShiftEntries.map((entry) => (
                <article className="task-item" key={entry.id}>
                  <div>
                    <h3>{entry.username}</h3>
                    <p>
                      Task: <strong>{entry.task_name || "Unassigned"}</strong>
                    </p>
                    <p>
                      Clocked in: {formatTimeEntryDate(entry.started_at)} | Break start: {formatTimeEntryDate(entry.break_start)}
                    </p>
                    <p>
                      Clocked out: {entry.ended_at ? formatTimeEntryDate(entry.ended_at) : "Still active"} | Break end: {entry.break_end ? formatTimeEntryDate(entry.break_end) : "-"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="info-message">No laborer shift entries found.</p>
          )}
        </section>
      )}
    </section>
  );
}

export default TimeTracking;