import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Book } from '../types';
import BookCard from '../components/BookCard';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRating, pageSize]);

  const filteredBooks = books.filter((b: Book) => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterRating !== '') {
      const rating = calcRatingFloor(b.comments);
      if (rating === null || rating !== (filterRating as number)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

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
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Оценка:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === '' ? '' : Number(e.target.value))}
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
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Показано {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredBooks.length)} из {filteredBooks.length} книг
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>На странице:</span>
              <div className="filter-box" style={{ padding: '6px 10px' }}>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid">
            {paginatedBooks.map((book: Book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/books/${book.id}`)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              marginTop: '40px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={navBtnStyle(currentPage === 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`dots-${idx}`} style={{
                    padding: '0 4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    userSelect: 'none',
                  }}>
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    style={pageBtnStyle(page === currentPage)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={navBtnStyle(currentPage === totalPages)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
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

const pageBtnStyle = (isActive: boolean): React.CSSProperties => ({
  width: '38px',
  height: '38px',
  borderRadius: '8px',
  border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
  background: isActive ? 'var(--accent-dim)' : 'var(--bg-card)',
  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
  fontWeight: isActive ? '700' : '400',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, sans-serif',
});

const navBtnStyle = (isDisabled: boolean): React.CSSProperties => ({
  width: '38px',
  height: '38px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  opacity: isDisabled ? 0.4 : 1,
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export default Books;