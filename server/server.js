const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE']
}));

const db = new Database('habits.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS habit_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  )
`).run();

// Роуты
app.get('/habits', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits').all();
  res.json(habits);
});

app.post('/habits', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  try {
    const stmt = db.prepare('INSERT INTO habits (title) VALUES (?)');
    const result = stmt.run(title);
    res.status(201).json({ 
      id: result.lastInsertRowid, 
      title 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

app.get('/habits/:id/days', (req, res) => {
  const { id } = req.params;
  const days = db.prepare('SELECT * FROM habit_days WHERE habit_id = ?').all(id);
  res.json(days);
});

app.post('/habits/:id/days', (req, res) => {
  const { id } = req.params;
  const date = new Date().toISOString().split('T')[0]; // Сегодняшняя дата

  try {
    // Проверка существования привычки
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Добавление дня
    const stmt = db.prepare('INSERT INTO habit_days (habit_id, date) VALUES (?, ?)');
    stmt.run(id, date);

    // Возврат обновленного списка дней
    const days = db.prepare('SELECT date FROM habit_days WHERE habit_id = ?').all(id);
    res.status(201).json(days);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to add day' });
  }
});

app.delete('/habits/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  res.sendStatus(204);
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});