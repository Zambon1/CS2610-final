import { useState } from "react";
import { useNavigate } from "react-router";
import { useRequireUser } from "../hooks/useRequireUser";
import ProjectForm from "../components/ProjectForm";

function ProjectFormPage() {
  const user = useRequireUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  if (!user.isSupervisor) {
    return <p className="info-message">Supervisor access is required to create projects.</p>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/project", {
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
        throw new Error(data.error || "Unable to create project.");
      }

      navigate(`/projects/${data.project.id}`);
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  }

  return (
    <section className="project-page project-form-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Create a new project</h1>
          <p className="page-copy">Supervisors can add a new project and assign details here.</p>
        </div>
      </div>

      <div className="detail-card">
        <ProjectForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          estimatedCompletionDate={estimatedCompletionDate}
          setEstimatedCompletionDate={setEstimatedCompletionDate}
          onSubmit={handleSubmit}
          submitLabel="Create project"
          error={error}
          loading={loading}
        />
      </div>
    </section>
  );
}

export default ProjectFormPage;