const request = require('supertest');
const { app, db } = require('../src/app'); // Импорт и app, и db

let server;

beforeAll(done => {
  server = app.listen(0, done); // 0 = динамический порт, чтобы избежать EADDRINUSE
});

afterAll(done => {
  server.close(() => {
    db.close(); // Закрытие базы данных
    done();
  });
});

describe('Тестирование REST API /books', () => {
  test('GET /books — должен вернуть массив книг', async () => {
    const res = await request(server).get('/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /books — должен добавить новую книгу', async () => {
    const newBook = { title: "Новая книга", author: "Автор", year: 2024 };
    const res = await request(server).post('/books').send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(newBook.title);
  });

  test('PUT /books/:id — должен обновить книгу', async () => {
    const update = { title: "Обновлено", author: "Автор", year: 2025 };
    const created = await request(server).post('/books').send({ title: "X", author: "Y", year: 2000 });
    const res = await request(server).put(`/books/${created.body.id}`).send(update);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(update.title);
  });

  test('DELETE /books/:id — должен удалить книгу', async () => {
    const created = await request(server).post('/books').send({ title: "X", author: "Y", year: 2000 });
    const res = await request(server).delete(`/books/${created.body.id}`);
    expect(res.statusCode).toBe(204);
  });
});
