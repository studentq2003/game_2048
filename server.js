const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Настройки подключения к базе данных
const pool = new Pool({
  user: 'admin', // Замените на ваше
  host: 'db', // Или 'db', если используете docker-compose
  database: 'leaderboards', // Замените на ваше
  password: 'kingofpenis228', // Замените на ваше
  port: 5432,
});

// Отдаем статические файлы (например, фронтенд вашего приложения)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Для разбора JSON-тел запросов


// API-эндпоинт для получения рейтинга
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nickname, score, attempt_timestamp FROM scores ORDER BY score DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error querying leaderboard:', err);
    res.status(500).send('Server error');
  }
});

app.post('/api/scores', async (req, res) => {
    const { nickname, score } = req.body; // убедитесь, что используете bodyParser для разбора JSON-тела запроса
    try {
      const result = await pool.query('INSERT INTO scores (nickname, score) VALUES ($1, $2) RETURNING *', [nickname, score]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error inserting score:', error);
      res.status(500).send('Server error');
    }
  });
  

// Опционально: базовый маршрут для отдачи index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
