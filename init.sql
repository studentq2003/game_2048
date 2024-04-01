-- init.sql
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    attempt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Добавьте здесь любые дополнительные команды SQL для инициализации.
