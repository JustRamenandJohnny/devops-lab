const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к базе данных
const db = new sqlite3.Database('./library.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
  } else {
    console.log('Подключено к SQLite базе данных');
    initializeDatabase();
  }
});

// Инициализация БД (создание таблицы)
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка создания таблицы:', err.message);
    } else {
      // Добавляем тестовые данные, если таблица пуста
      db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
        if (row.count === 0) {
          db.run(
            "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
            ["1984", "Джордж Оруэлл", 1949]
          );
          db.run(
            "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
            ["Мастер и Маргарита", "Михаил Булгаков", 1967]
          );
        }
      });
    }
  });
}

// Валидация данных книги
function validateBook(book) {
  const errors = [];
  if (!book.title || book.title.length < 2) {
    errors.push("Название книги должно содержать минимум 2 символа");
  }
  if (!book.author || book.author.length < 2) {
    errors.push("Имя автора должно содержать минимум 2 символа");
  }
  if (!book.year || isNaN(book.year) || book.year < 0) {
    errors.push("Год издания должен быть положительным числом");
  }
  return errors;
}

// GET /books - Получить все книги
app.get('/books', (req, res) => {
  db.all("SELECT * FROM books", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /books - Добавить новую книгу
app.post('/books', (req, res) => {
  const book = req.body;
  const errors = validateBook(book);
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  db.run(
    "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
    [book.title, book.author, book.year],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        ...book
      });
    }
  );
});

// PUT /books/:id - Обновить книгу
app.put('/books/:id', (req, res) => {
  const id = req.params.id;
  const book = req.body;
  const errors = validateBook(book);
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  db.run(
    "UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?",
    [book.title, book.author, book.year, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Книга не найдена" });
      }
      res.json({ id, ...book });
    }
  );
});

// DELETE /books/:id - Удалить книгу
app.delete('/books/:id', (req, res) => {
  const id = req.params.id;
  db.run(
    "DELETE FROM books WHERE id = ?",
    id,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Книга не найдена" });
      }
      res.sendStatus(204);
    }
  );
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Что-то пошло не так!" });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер библиотеки запущен на http://localhost:${PORT}`);
});

module.exports = app; // Для тестирования