-- Création des tables TaskWatch

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    time_logged INTEGER DEFAULT 0,
    timer_started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEX idx_tasks_user_id ON tasks(user_id);
-- CREATE INDEX idx_tasks_status ON tasks(status);
-- CREATE INDEX idx_tasks_name ON tasks(name);
-- CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion d'un utilisateur de test
-- Le hash bcrypt pour "password123" : $2b$10$K7YCkWX3H5x8rQ5YCkWX3eZGQxKvVxKvVxKvVxKvVxKvVxKvVxKvVu
INSERT INTO users (email, password, name) VALUES 
    ('test@example.com', '$2b$10$K7YCkWX3H5x8rQ5YCkWX3eZGQxKvVxKvVxKvVxKvVxKvVxKvVxKvVu', 'Utilisateur Test')
ON CONFLICT (email) DO NOTHING;

-- Table de logs des requêtes HTTP
CREATE TABLE IF NOT EXISTS request_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    route TEXT,
    method TEXT,
    status_code INTEGER,
    duration_ms INTEGER,
    error_message TEXT
);
