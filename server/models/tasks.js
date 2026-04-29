import pool from "../db/connection.js";

export async function createTask(name, description = "", projectId = null) {
    const result = await pool.query(
        "INSERT INTO tasks (name, description, project_id, completed) VALUES ($1, $2, $3, FALSE) RETURNING *",
        [name, description, projectId]
    );
    return result.rows[0];
}

export async function getActiveTasks(projectId = null) {
    if (projectId) {
        const { rows } = await pool.query(
            "SELECT * FROM tasks WHERE completed = FALSE AND project_id = $1 ORDER BY created_at DESC, id DESC",
            [projectId]
        );
        return rows;
    }

    const { rows } = await pool.query(
        "SELECT * FROM tasks WHERE completed = FALSE ORDER BY created_at DESC, id DESC"
    );
    return rows;
}

export async function getAllTasks() {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC, id DESC");
    return rows;
}

export async function getTaskById(id) {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    return rows[0] || null;
}

export async function updateTask(id, name, description = "", completed = false) {
    const result = await pool.query(
        "UPDATE tasks SET name = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *",
        [name, description, completed, id]
    );
    return result.rows[0] || null;
}

export async function deleteTask(id) {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
}