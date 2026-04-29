import pool from "../db/connection.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function createUser(username, email, password, isSupervisor = false) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash, is_supervisor) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_supervisor, created_at",
    [username, email, passwordHash, isSupervisor]
  );
  return result.rows[0];
}

export async function findByUsername(username) {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0] || null;
}

export async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
}

export async function findById(id) {
  const result = await pool.query(
    "SELECT id, username, email, is_supervisor, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId) {
  const sessionId = crypto.randomUUID();
  await pool.query(
    "INSERT INTO sessions (session_id, user_id) VALUES ($1, $2)",
    [sessionId, userId]
  );
  return sessionId;
}

export async function findSession(sessionId) {
  const result = await pool.query(
    `SELECT sessions.*, users.id AS user_id, users.username, users.email, users.is_supervisor
     FROM sessions
     JOIN users ON sessions.user_id = users.id
     WHERE sessions.session_id = $1`,
    [sessionId]
  );
  return result.rows[0] || null;
}

export async function deleteSession(sessionId) {
  await pool.query("DELETE FROM sessions WHERE session_id = $1", [sessionId]);
}
