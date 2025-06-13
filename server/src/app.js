const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

// Настройка CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://client:80'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Подключение к базе данных
const db = new sqlite3.Database('./library.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
  } else {
    console.log('Подключено к SQLite базе данных');
    initializeDatabase();
  }
});

// Инициализация БД
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
      seedDatabase();
    }
  });
}

// Заполнение тестовыми данными
function seedDatabase() {
  db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
    if (row.count === 0) {
      const initialBooks = [
        ["1984", "Джордж Оруэлл", 1949],
        ["Мастер и Маргарита", "Михаил Булгаков", 1967],
        ["Преступление и наказание", "Фёдор Достоевский", 1866]
      ];
      
      const stmt = db.prepare("INSERT INTO books (title, author, year) VALUES (?, ?, ?)");
      initialBooks.forEach(book => stmt.run(book));
      stmt.finalize();
    }
  });
}

// Валидация данных книги
function validateBook(book) {
  const errors = [];
  const currentYear = new Date().getFullYear();
  
  if (!book.title || book.title.trim().length < 2) {
    errors.push("Название книги должно содержать минимум 2 символа");
  }
  
  if (!book.author || book.author.trim().length < 2) {
    errors.push("Имя автора должно содержать минимум 2 символа");
  }
  
  if (!book.year || isNaN(book.year)) {
    errors.push("Год издания должен быть числом");
  } else if (book.year < 1000 || book.year > currentYear + 5) {
    errors.push(`Год издания должен быть между 1000 и ${currentYear + 5}`);
  }
  
  return errors;
}

// Роуты
app.get('/books', (req, res) => {
  db.all("SELECT * FROM books ORDER BY title", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/books', (req, res) => {
  const book = req.body;
  const errors = validateBook(book);
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  db.run(
    "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
    [book.title.trim(), book.author.trim(), book.year],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        title: book.title,
        author: book.author,
        year: book.year
      });
    }
  );
});

app.put('/books/:id', (req, res) => {
  const id = req.params.id;
  const book = req.body;
  const errors = validateBook(book);
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  db.run(
    "UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?",
    [book.title.trim(), book.author.trim(), book.year, id],
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

// Обработка ошибок
app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер библиотеки запущен на http://localhost:${PORT}`);
});

module.exports = { app, db };