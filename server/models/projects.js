import pool from "../db/connection.js";

export async function createProject(name, description, location, supervisorId, estimatedCompletionDate) {
    const result = await pool.query(
        "INSERT INTO projects (name, description, location, supervisor_id, estimated_completion_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, description, location, supervisorId, estimatedCompletionDate]
    );
    return result.rows[0];
}

export async function getAllProjects() {
    const { rows } = await pool.query("SELECT * FROM projects ORDER BY created_at DESC, id DESC");
    return rows;
}

export async function getProjectById(id) {
    const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    return rows[0] || null;
}

export async function updateProject(id, name, description, location, supervisorId, estimatedCompletionDate) {
    const result = await pool.query(
        "UPDATE projects SET name = $1, description = $2, location = $3, supervisor_id = $4, estimated_completion_date = $5 WHERE id = $6 RETURNING *",
        [name, description, location, supervisorId, estimatedCompletionDate, id]
    );
    return result.rows[0] || null;
}

export async function deleteProject(id) {
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
}

export async function getProjectsWithOpenTasks() {
    const { rows: projects } = await pool.query(
        "SELECT * FROM projects ORDER BY created_at DESC, id DESC"
    );

    const { rows: tasks } = await pool.query(
        "SELECT * FROM tasks WHERE completed = FALSE ORDER BY created_at DESC, id DESC"
    );

    return projects.map((project) => ({
        ...project,
        tasks: tasks.filter((task) => task.project_id === project.id),
    }));
}

export async function getProjectWithOpenTasksById(id) {
    const { rows } = await pool.query(
        `SELECT
            projects.*,
            users.username AS supervisor_name
         FROM projects
         LEFT JOIN users ON projects.supervisor_id = users.id
         WHERE projects.id = $1`,
        [id]
    );

    const project = rows[0] || null;

    if (!project) {
        return null;
    }

    const { rows: tasks } = await pool.query(
        "SELECT * FROM tasks WHERE completed = FALSE AND project_id = $1 ORDER BY created_at DESC, id DESC",
        [id]
    );

    return {
        ...project,
        tasks,
    };
}