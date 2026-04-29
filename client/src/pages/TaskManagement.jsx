import { useEffect, useState } from "react";
import { useRequireUser } from "../hooks/useRequireUser";
import TaskForm from "../components/TaskForm";

function TaskManagement() {
  const user = useRequireUser();
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/task?all=true");
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Unable to load tasks.");
        }

        setTasks(data.tasks || []);
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
      loadTasks();
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  if (!user.isSupervisor) {
    return (
      <section className="task-page">
        <div className="detail-card">
          <p className="info-message">Supervisor access is required to manage tasks.</p>
        </div>
      </section>
    );
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setCompleted(false);
  }

  function startEdit(task) {
    setEditingId(task.id);
    setName(task.name);
    setDescription(task.description || "");
    setCompleted(Boolean(task.completed));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name,
          description,
          completed,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to save task.");
      }

      if (editingId) {
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === data.task.id ? data.task : task))
        );
      } else {
        setTasks((currentTasks) => [data.task, ...currentTasks]);
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCompletion(task) {
    setSaving(true);
    setError("");

    try {
      const nextCompleted = !task.completed;
      const res = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          name: task.name,
          description: task.description || "",
          completed: nextCompleted,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to update task status.");
      }

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => (currentTask.id === data.task.id ? data.task : currentTask))
      );

      if (editingId === data.task.id) {
        setCompleted(Boolean(data.task.completed));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(taskId) {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/task/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to delete task.");
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      if (editingId === taskId) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="task-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Task management</p>
          <h1>Manage tasks</h1>
          <p className="page-copy">Supervisors can add, edit, and delete tasks. Completed tasks stay visible here.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="task-layout">
        <section className="detail-card">
          <div className="section-heading">
            <h2>{editingId ? "Edit task" : "Add task"}</h2>
            <p>Workers can select active tasks when clocking in. Completed tasks remain in this list for reference.</p>
          </div>
          <TaskForm
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            onSubmit={handleSubmit}
            submitLabel={editingId ? "Save changes" : "Add task"}
            error={""}
            loading={saving}
          />
          {editingId && (
            <button className="btn btn-logout task-cancel-button" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </section>

        <section className="detail-card">
          <div className="section-heading">
            <h2>All tasks</h2>
            <p>Only active tasks can be selected on the time tracking page.</p>
          </div>

          {loading ? (
            <p className="info-message">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="info-message">No active tasks yet.</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-item" key={task.id}>
                  <div>
                    <h3>{task.name}</h3>
                    <p>{task.description || "No description provided."}</p>
                  </div>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="status-pill task-status-pill"
                      onClick={() => handleToggleCompletion(task)}
                      disabled={saving}
                    >
                      {task.completed ? "Done" : "Not done"}
                    </button>
                    <button className="btn btn-primary" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default TaskManagement;