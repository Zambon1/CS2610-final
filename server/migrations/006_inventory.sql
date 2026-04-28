CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    status INTEGER NOT NULL, -- 0 = available, 1 = in use, 2 = under maintenance
    created_at TIMESTAMP DEFAULT NOW()
);