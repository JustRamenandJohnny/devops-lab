import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', year: '' });
  const [editBook, setEditBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:3000/books');
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      setBooks(data);
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
      const response = await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (!response.ok) throw new Error('Ошибка при добавлении книги');
      setNewBook({ title: '', author: '', year: '' });
      fetchBooks();
    } catch (error) {
      console.error('Ошибка добавления книги:', error);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/books/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Ошибка при удалении книги');
      fetchBooks();
    } catch (error) {
      console.error('Ошибка удаления книги:', error);
    }
  };

  const startEditing = (book) => {
    setEditBook({ ...book });
  };

  const cancelEditing = () => {
    setEditBook(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditBook(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };

  const submitEdit = async () => {
    if (!editBook.title || !editBook.author || !editBook.year) {
      alert('Заполните все поля для редактирования!');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/books/${editBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editBook.title,
          author: editBook.author,
          year: editBook.year
        })
      });
      if (!response.ok) throw new Error('Ошибка обновления книги');
      setEditBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Ошибка обновления книги:', error);
    }
  };

  return (
    <div className="app">
      <h1>Библиотека</h1>

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
