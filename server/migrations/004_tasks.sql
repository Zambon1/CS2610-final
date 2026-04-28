CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);