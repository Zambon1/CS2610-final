CREATE TABLE IF NOT EXISTS time (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NOT NULL,
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);