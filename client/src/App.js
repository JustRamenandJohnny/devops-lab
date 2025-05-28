import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', year: '' });
  const [editBook, setEditBook] = useState(null); // { id, title, author, year } или null

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
      alert('Ошибка загрузки книг');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ 
      ...prev, 
      [name]: name === 'year' ? parseInt(value) || '' : value 
    }));
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.year) {
      alert('Заполните все поля!');
      return;
    }
    try {
      await axios.post('http://localhost:3000/books', newBook);
      setNewBook({ title: '', author: '', year: '' });
      fetchBooks();
    } catch (error) {
      console.error('Ошибка добавления книги:', error);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/books/${id}`);
      fetchBooks();
    } catch (error) {
      console.error('Ошибка удаления книги:', error);
    }
  };

  // Открыть форму редактирования
  const startEditing = (book) => {
    setEditBook({ ...book }); // копируем книгу в состояние редактирования
  };

  // Отмена редактирования
  const cancelEditing = () => {
    setEditBook(null);
  };

  // Обработчик изменений в форме редактирования
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditBook(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };

  // Отправка обновлённой книги на сервер
  const submitEdit = async () => {
    if (!editBook.title || !editBook.author || !editBook.year) {
      alert('Заполните все поля для редактирования!');
      return;
    }
    try {
      await axios.put(`http://localhost:3000/books/${editBook.id}`, {
        title: editBook.title,
        author: editBook.author,
        year: editBook.year
      });
      setEditBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Ошибка обновления книги:', error);
    }
  };

  return (
    <div className="app">
      <h1>Библиотека</h1>

      {/* Форма добавления */}
      <div className="form">
        <input
          name="title"
          placeholder="Название книги"
          value={newBook.title}
          onChange={handleInputChange}
        />
        <input
          name="author"
          placeholder="Автор"
          value={newBook.author}
          onChange={handleInputChange}
        />
        <input
          name="year"
          placeholder="Год издания"
          type="number"
          value={newBook.year}
          onChange={handleInputChange}
        />
        <button onClick={handleAddBook}>Добавить книгу</button>
      </div>

      {/* Форма редактирования (показывается, если editBook !== null) */}
      {editBook && (
        <div className="form edit-form">
          <h2>Редактировать книгу</h2>
          <input
            name="title"
            placeholder="Название книги"
            value={editBook.title}
            onChange={handleEditChange}
          />
          <input
            name="author"
            placeholder="Автор"
            value={editBook.author}
            onChange={handleEditChange}
          />
          <input
            name="year"
            placeholder="Год издания"
            type="number"
            value={editBook.year}
            onChange={handleEditChange}
          />
          <button onClick={submitEdit}>Сохранить</button>
          <button onClick={cancelEditing}>Отмена</button>
        </div>
      )}

      {/* Список книг */}
      <ul className="book-list">
        {books.map(book => (
          <li key={book.id}>
            <span>{book.title} - {book.author} ({book.year})</span>
            <button onClick={() => startEditing(book)}>Редактировать</button>
            <button onClick={() => handleDeleteBook(book.id)} className="delete-btn">Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
