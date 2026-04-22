import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Comment } from '../types';
import { MessageSquare, Star, BookOpen, User, Search, Trash2, Edit2 } from 'lucide-react';
import CommentFormModal from '../components/CommentFormModal';
import { useToast } from '../context/ToastContext';

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [filterRating, setFilterRating] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
        <div className="comments-list">
          {filteredComments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Отзывов не найдено</p>
            </div>
          ) : (
            filteredComments.map((c: Comment) => (
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

export default Comments;