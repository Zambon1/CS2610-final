function ProjectForm({
  name,
  setName,
  description,
  setDescription,
  location,
  setLocation,
  estimatedCompletionDate,
  setEstimatedCompletionDate,
  onSubmit,
  submitLabel,
  error,
  loading,
}) {
  return (
    <form className="project-form" onSubmit={onSubmit}>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="project-name">Project name</label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-grid project-form-grid">
        <div className="form-group">
          <label htmlFor="project-location">Site location</label>
          <input
            id="project-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="project-completion">Estimated completion</label>
          <input
            id="project-completion"
            type="date"
            value={estimatedCompletionDate}
            onChange={(e) => setEstimatedCompletionDate(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default ProjectForm;