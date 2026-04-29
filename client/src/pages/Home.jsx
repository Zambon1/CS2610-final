import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useRequireUser } from "../hooks/useRequireUser";
import CountdownTimer from "../components/CountdownTimer";

function Home() {
  const user = useRequireUser();
  const [timeState, setTimeState] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timeError, setTimeError] = useState("");
  const [projectsError, setProjectsError] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const displayedProjects = projects.slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    async function loadTime() {
      try {
        const res = await fetch("/api/time");
        const data = await res.json();

        if (!cancelled) {
          if (res.ok) {
            setTimeState(data);
          } else {
            setTimeError(data.error || "Unable to load timer.");
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setTimeError(requestError.message);
        }
      }
    }

    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError("");

      try {
        const res = await fetch("/api/project");
        const data = await res.json();

        if (!cancelled) {
          if (res.ok) {
            setProjects(data.projects || []);
          } else {
            setProjectsError(data.error || "Unable to load projects.");
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setProjectsError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    }

    if (user) {
      loadTime();
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
    <>
      <section className="home-hero detail-card">
        <p className="eyebrow">Home</p>
        <h1>Welcome, {user.username}.</h1>
        <p className="page-copy">
          Check your current shift timer, then jump into inventory, tasks, or time tracking.
        </p>
      </section>

      <div className="home-main-grid">
        <section className="detail-card home-projects-card">
          <div className="section-heading">
            <h2>Projects</h2>
            <p>Open projects are visible to both supervisors and laborers.</p>
          </div>
          {projectsError && <p className="error-message">{projectsError}</p>}
          {projectsLoading ? (
            <p className="info-message">Loading projects...</p>
          ) : displayedProjects.length === 0 ? (
            <p className="info-message">No projects have been created yet.</p>
          ) : (
            <div className="project-list home-project-list">
              {displayedProjects.map((project) => (
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
          <div className="home-link-row">
            <Link to="/projects" className="btn btn-primary home-link-button">
              View all projects
            </Link>
          </div>
        </section>

        <section className="detail-card home-time-card">
          <div className="section-heading">
            <h2>At a glance</h2>
            <p>Your current shift timer and task status.</p>
          </div>
          {timeError && <p className="error-message">{timeError}</p>}
          {timeState?.activeTime ? (
            <>
              <CountdownTimer
                targetTimestamp={timeState.shiftEndsAt}
                label="Shift countdown"
              />
              <p className="home-task-line">
                Current task: <strong>{timeState.currentTask?.name || "Unassigned"}</strong>
              </p>
              <Link to="/time" className="btn btn-primary home-link-button">
                Open time tracking
              </Link>
            </>
          ) : (
            <>
              <p className="info-message">No active shift right now.</p>
              <Link to="/time" className="btn btn-primary home-link-button">
                Go to time tracking
              </Link>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default Home;
