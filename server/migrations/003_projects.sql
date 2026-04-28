CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    location TEXT,
    estimated_completion_date DATE,
    supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);