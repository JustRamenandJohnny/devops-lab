const request = require('supertest');
const app = require('../src/app');

describe('Тестирование REST API /books', () => {
  let createdBookId;

  it('GET /books — должен вернуть массив книг', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /books — должен добавить новую книгу', async () => {
    const res = await request(app).post('/books').send({
      title: 'Тестовая книга',
      author: 'Автор Тестов',
      year: 2024
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdBookId = res.body.id;
  });

  it('PUT /books/:id — должен обновить книгу', async () => {
    const res = await request(app).put(`/books/${createdBookId}`).send({
      title: 'Обновлено',
      author: 'Автор Обновлён',
      year: 2025
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Обновлено');
  });

  it('DELETE /books/:id — должен удалить книгу', async () => {
    const res = await request(app).delete(`/books/${createdBookId}`);
    expect(res.statusCode).toBe(204);
  });
});
