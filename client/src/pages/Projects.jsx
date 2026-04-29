import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useRequireUser } from "../hooks/useRequireUser";

function Projects() {
  const user = useRequireUser();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/project");
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Unable to load projects.");
        }

        setProjects(data.projects || []);
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
      loadProjects();
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <section className="project-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Project overview</h1>
          <p className="page-copy">View project details and unfinished tasks.</p>
        </div>
        {user.isSupervisor && (
          <Link to="/projects/new" className="btn btn-primary">
            New project
          </Link>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="info-message">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="info-message">No projects have been created yet.</p>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <article className="detail-card project-card" key={project.id}>
              <div className="project-card-header">
                <div>
                  <p className="eyebrow">Project #{project.id}</p>
                  <h2>{project.name}</h2>
                  <p className="page-copy">{project.location || "No site location listed."}</p>
                </div>
                <Link to={`/projects/${project.id}`} className="btn btn-primary">
                  View details
                </Link>
              </div>
              <p className="project-task-count">{project.tasks?.length || 0} unfinished task(s)</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;