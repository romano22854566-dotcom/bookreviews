import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Book } from '../types';
import BookCard from '../components/BookCard';
import { Search, Plus } from 'lucide-react';
import BookFormModal from '../components/BookFormModal';
import { useToast } from '../context/ToastContext';

function calcRatingFloor(comments: string[]): number | null {
  if (!comments || comments.length === 0) return null;
  const ratings: number[] = [];
  comments.forEach((c: string) => {
    const match = c.match(/^\[(\d+)\/10\]/);
    if (match) ratings.push(parseInt(match[1], 10));
  });
  if (ratings.length === 0) return null;
  const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
  return Math.floor(avg);
}

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadBooks = () => {
    api.get('/books')
      .then((res) => {
        setBooks(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        showToast('Не удалось загрузить книги', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredBooks = books.filter((b: Book) => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterRating !== '') {
      const rating = calcRatingFloor(b.comments);
      if (rating === null || rating !== (filterRating as number)) return false;
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Каталог книг</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Оценка:
            </span>
            <select
              value={filterRating}
              onChange={(e) =>
                setFilterRating(e.target.value === '' ? '' : Number(e.target.value))
              }
            >
              <option value="">Все</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                <option key={r} value={r}>{r} / 10</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Добавить книгу
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Загрузка...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Книги не найдены
        </div>
      ) : (
        <div className="grid">
          {filteredBooks.map((book: Book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => navigate(`/books/${book.id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BookFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadBooks();
            showToast('Книга успешно добавлена', 'success');
          }}
        />
      )}
    </div>
  );
};

export default Books;