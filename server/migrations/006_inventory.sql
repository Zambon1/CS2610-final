CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW()
);