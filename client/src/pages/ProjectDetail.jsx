import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useRequireUser } from "../hooks/useRequireUser";
import ProjectForm from "../components/ProjectForm";

function formatProjectDate(value) {
  if (!value) {
    return "";
  }

  const isDateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = isDateOnly ? new Date(`${value}T00:00:00`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

function ProjectDetail() {
  const user = useRequireUser();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const [project, setProject] = useState(null);
  const [supervisorName, setSupervisorName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/project/${id}`);
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Unable to load project.");
        }

        setProject(data.project);
        setName(data.project.name || "");
        setDescription(data.project.description || "");
        setLocation(data.project.location || "");
        setEstimatedCompletionDate(data.project.estimated_completion_date || "");
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
      loadProject();
    }

    return () => {
      cancelled = true;
    };
  }, [user, id]);

  useEffect(() => {
    let cancelled = false;

    async function loadSupervisorName() {
      if (!project?.supervisor_id) {
        setSupervisorName("Unassigned");
        return;
      }

      try {
        const res = await fetch(`/api/auth/users/${project.supervisor_id}`);
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Unable to load supervisor.");
        }

        setSupervisorName(data.user?.username || "Unassigned");
      } catch (requestError) {
        if (!cancelled) {
          setSupervisorName("Unassigned");
        }
      }
    }

    if (project) {
      loadSupervisorName();
    }

    return () => {
      cancelled = true;
    };
  }, [project?.supervisor_id, project]);

  if (!user) {
    return null;
  }

  async function handleProjectSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/project/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          location,
          estimatedCompletionDate,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to save project.");
      }

      setProject((currentProject) => ({
        ...currentProject,
        ...data.project,
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTaskAdd(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/project/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: taskName,
          description: taskDescription,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to add task.");
      }

      setProject((currentProject) => ({
        ...currentProject,
        tasks: [data.task, ...(currentProject?.tasks || [])],
      }));
      setTaskName("");
      setTaskDescription("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTaskComplete(task) {
    setCompletingTaskId(task.id);
    setError("");

    try {
      const res = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          name: task.name,
          description: task.description || "",
          completed: true,
          projectId: task.project_id,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to complete task.");
      }

      setProject((currentProject) => ({
        ...currentProject,
        tasks: (currentProject?.tasks || []).filter((currentTask) => currentTask.id !== task.id),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCompletingTaskId(null);
    }
  }

  async function handleProjectDelete() {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/project/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to delete project.");
      }

      navigate("/projects");
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="info-message">Loading project...</p>;
  }

  if (error && !project) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <section className="project-page project-detail-page">
      <Link to="/projects" className="back-link">
        Back to projects
      </Link>
      <div className="detail-card project-hero-card">
        <div className="project-card-header">
          <div>
            <p className="eyebrow">Project #{project.id}</p>
            <h1>{project.name}</h1>
            <p className="page-copy">{project.location || "No site location listed."}</p>
          </div>
          <div className="project-header-actions">
            {project.estimated_completion_date && (
              <span className="status-pill">Due {formatProjectDate(project.estimated_completion_date)}</span>
            )}
            {authUser?.isSupervisor && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleProjectDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete project"}
              </button>
            )}
          </div>
        </div>
        <p className="page-copy">{project.description || "No project description provided."}</p>
        <div className="detail-grid project-meta-grid">
          <div>
            <span className="detail-label">Supervisor</span>
            <strong>{supervisorName || "Unassigned"}</strong>
          </div>
          <div>
            <span className="detail-label">Tasks left</span>
            <strong>{project.tasks?.length || 0}</strong>
          </div>
          <div>
            <span className="detail-label">Created</span>
            <strong>{new Date(project.created_at).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {authUser?.isSupervisor && (
        <div className="project-admin-grid">
          <section className="detail-card">
            <div className="section-heading">
              <h2>Edit project</h2>
              <p>Supervisors can update project details here.</p>
            </div>
            <ProjectForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              location={location}
              setLocation={setLocation}
              estimatedCompletionDate={estimatedCompletionDate}
              setEstimatedCompletionDate={setEstimatedCompletionDate}
              onSubmit={handleProjectSave}
              submitLabel="Save project"
              error={error}
              loading={saving}
            />
          </section>

          <section className="detail-card">
            <div className="section-heading">
              <h2>Add task to this project</h2>
              <p>New tasks are automatically attached to this project.</p>
            </div>
            <form className="project-task-form" onSubmit={handleTaskAdd}>
              <div className="form-group">
                <label htmlFor="project-task-name">Task name</label>
                <input
                  id="project-task-name"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="project-task-description">Description</label>
                <textarea
                  id="project-task-description"
                  rows="4"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Add task"}
              </button>
            </form>
          </section>
        </div>
      )}

      <section className="detail-card">
        <div className="section-heading">
          <h2>Unfinished tasks</h2>
          <p>These are the tasks still needing to be completed on this project.</p>
        </div>
        {project.tasks?.length ? (
          <div className="task-list">
            {project.tasks.map((task) => (
              <article className="task-item" key={task.id}>
                <div>
                  <h3>{task.name}</h3>
                  <p>{task.description || "No description provided."}</p>
                </div>
                <div className="task-actions">
                  <span className="status-pill">Active</span>
                  {authUser?.isSupervisor && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleTaskComplete(task)}
                      disabled={completingTaskId === task.id}
                    >
                      {completingTaskId === task.id ? "Completing..." : "Mark complete"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="info-message">No unfinished tasks on this project.</p>
        )}
      </section>
    </section>
  );
}

export default ProjectDetail;