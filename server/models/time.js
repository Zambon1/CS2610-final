import pool from "../db/connection.js";

export async function createTimeEntry(userId, taskId) {
    const result = await pool.query(
        "INSERT INTO time (user_id, task_id, started_at) VALUES ($1, $2, NOW()) RETURNING *",
        [userId, taskId]
    );
    return result.rows[0];
}

export async function getActiveTimeEntryByUserId(userId) {
    const { rows } = await pool.query(
        "SELECT * FROM time WHERE user_id = $1 AND ended_at IS NULL ORDER BY started_at DESC, id DESC LIMIT 1",
        [userId]
    );
    return rows[0] || null;
}

export async function getTimeEntryById(id) {
    const { rows } = await pool.query("SELECT * FROM time WHERE id = $1", [id]);
    return rows[0] || null;
}

export async function endTimeEntry(id) {
    const result = await pool.query(
        "UPDATE time SET ended_at = NOW(), break_end = CASE WHEN break_start IS NOT NULL AND break_end IS NULL THEN NOW() ELSE break_end END WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0] || null;
}

export async function startBreak(id) {
    const result = await pool.query(
        "UPDATE time SET break_start = NOW() WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0] || null;
}

export async function endBreak(id) {
    const result = await pool.query(
        "UPDATE time SET break_end = NOW() WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0] || null;
}

export async function switchTask(id, taskId) {
    const result = await pool.query(
        "UPDATE time SET task_id = $1 WHERE id = $2 RETURNING *",
        [taskId, id]
    );
    return result.rows[0] || null;
}

export async function getLaborerShiftEntries() {
    const { rows } = await pool.query(
        `SELECT
            time.id,
            time.user_id,
            time.task_id,
            time.started_at,
            time.ended_at,
            time.break_start,
            time.break_end,
            time.created_at,
            users.username AS username,
            users.is_supervisor AS is_supervisor,
            tasks.name AS task_name
         FROM time
         JOIN users ON time.user_id = users.id
         LEFT JOIN tasks ON time.task_id = tasks.id
         WHERE users.is_supervisor = FALSE
         ORDER BY time.started_at DESC, time.id DESC`
    );

    return rows;
}

export async function getPreviousShiftEntriesByUserId(userId) {
    const { rows } = await pool.query(
        `SELECT
            time.id,
            time.user_id,
            time.task_id,
            time.started_at,
            time.ended_at,
            time.break_start,
            time.break_end,
            time.created_at,
            tasks.name AS task_name
         FROM time
         LEFT JOIN tasks ON time.task_id = tasks.id
         WHERE time.user_id = $1
           AND time.ended_at IS NOT NULL
         ORDER BY time.started_at DESC, time.id DESC`,
        [userId]
    );

    return rows;
}