import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Comment } from '../types';
import { MessageSquare, Star, BookOpen, User, Search, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentFormModal from '../components/CommentFormModal';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [filterRating, setFilterRating] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadComments = () => {
    api.get('/comments')
      .then((res) => {
        setComments(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadComments(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [bookSearch, filterRating, pageSize]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Удалить этот отзыв?')) return;
    try {
      await api.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c.id !== id));
      showToast('Отзыв успешно удалён', 'success');
    } catch {
      showToast('Не удалось удалить отзыв', 'error');
    }
  };

  const handleEditClick = (e: React.MouseEvent, comment: Comment) => {
    e.stopPropagation();
    setEditComment(comment);
    setShowEditModal(true);
  };

  const filteredComments = comments.filter((c: Comment) => {
    const matchesBook = c.bookTitle
      ? c.bookTitle.toLowerCase().includes(bookSearch.toLowerCase())
      : bookSearch === '';
    const matchesRating = filterRating === '' || Math.floor(c.rating) === (filterRating as number);
    return matchesBook && matchesRating;
  });

  const totalPages = Math.ceil(filteredComments.length / pageSize);
  const paginatedComments = filteredComments.slice(
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
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare color="var(--accent)" /> Отзывы читателей
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Поиск по книге..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
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
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : (
        <>
          {filteredComments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Показано {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredComments.length)} из {filteredComments.length} отзывов
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
          )}

          <div className="comments-list">
            {filteredComments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p>Отзывов не найдено</p>
              </div>
            ) : (
              paginatedComments.map((c: Comment) => (
                <div
                  key={c.id}
                  className="comment-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/comments/${c.id}`)}
                >
                  <div className="comment-header">
                    <span className="comment-book" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} />
                      {c.bookTitle || 'Книга не указана'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="comment-score" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={16} fill="#f1c40f" color="#f1c40f" />
                        {c.rating} / 10
                      </span>
                      <button
                        className="back-btn"
                        style={{ marginBottom: 0, padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={(e) => handleEditClick(e, c)}
                        title="Редактировать отзыв"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn-delete"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={(e) => handleDelete(c.id, e)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="comment-text">
                    "{c.text || 'Текст отзыва отсутствует'}"
                  </p>
                  <div className="comment-footer">
                    <span className="comment-author" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} />
                      Автор: <b>{c.userName || 'Аноним'}</b>
                    </span>
                  </div>
                </div>
              ))
            )}
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
                  }}>…</span>
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

      {showEditModal && editComment && (
        <CommentFormModal
          bookTitle={editComment.bookTitle}
          editComment={editComment}
          onClose={() => { setShowEditModal(false); setEditComment(null); }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditComment(null);
            loadComments();
            showToast('Отзыв успешно обновлён', 'success');
          }}
        />
      )}
    </div>
  );
};

const pageBtnStyle = (isActive: boolean): React.CSSProperties => ({
  width: '38px', height: '38px', borderRadius: '8px',
  border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
  background: isActive ? 'var(--accent-dim)' : 'var(--bg-card)',
  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
  fontWeight: isActive ? '700' : '400',
  fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'Inter, sans-serif',
});

const navBtnStyle = (isDisabled: boolean): React.CSSProperties => ({
  width: '38px', height: '38px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'var(--bg-card)',
  color: isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  opacity: isDisabled ? 0.4 : 1, transition: 'all 0.15s ease',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});

export default Comments;