const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: 'admin',
  host: 'db',
  database: 'leaderboards',
  password: 'kingofpenis228',
  port: 5432,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


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
    const { nickname, score } = req.body;
    try {
      const result = await pool.query('INSERT INTO scores (nickname, score) VALUES ($1, $2) RETURNING *', [nickname, score]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error inserting score:', error);
      res.status(500).send('Server error');
    }
  });
  

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
