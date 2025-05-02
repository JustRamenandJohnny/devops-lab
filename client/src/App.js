import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ 
    title: '', 
    author: '', 
    year: '' 
  });

  // Загрузка книг при старте
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

      <ul className="book-list">
        {books.map(book => (
          <li key={book.id}>
            <span>
              {book.title} - {book.author} ({book.year})
            </span>
            <button 
              onClick={() => handleDeleteBook(book.id)}
              className="delete-btn"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;