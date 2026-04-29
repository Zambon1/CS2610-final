import pool from "../db/connection.js";

export async function createInventoryItem(name, quantity, status) {
    const result = await pool.query(
        "INSERT INTO inventory (name, quantity, status) VALUES ($1, $2, $3) RETURNING *",
        [name, quantity, status]
    );
    return result.rows[0];
}

export async function getInventory(search = "", status = "") {
    const filters = [];
    const values = [];

    if (search) {
        values.push(`%${search}%`);
        filters.push(`name ILIKE $${values.length}`);
    }

    if (status) {
        values.push(status);
        filters.push(`status = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const { rows } = await pool.query(
        `SELECT * FROM inventory ${whereClause} ORDER BY created_at DESC, id DESC`,
        values
    );
    return rows;
}

export async function getInventoryItemById(id) {
    const { rows } = await pool.query("SELECT * FROM inventory WHERE id = $1", [id]);
    return rows[0] || null;
}

export async function updateInventoryItem(id, name, quantity, status) {
    const result = await pool.query(
        "UPDATE inventory SET name = $1, quantity = $2, status = $3 WHERE id = $4 RETURNING *",
        [name, quantity, status, id]
    );
    return result.rows[0] || null;
}

export async function deleteInventoryItem(id) {
    await pool.query("DELETE FROM inventory WHERE id = $1", [id]);
}