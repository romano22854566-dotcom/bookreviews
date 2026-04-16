import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Book, Comment } from '../types';
import { Star, ArrowLeft, BookOpen, User, Edit2, Trash2 } from 'lucide-react';
import BookFormModal from '../components/BookFormModal';
import CommentFormModal from '../components/CommentFormModal';
import { useToast } from '../context/ToastContext';

const BookDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const { showToast } = useToast();

  const loadData = () => {
    api.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);
        setLoading(false);
      })
      .catch(() => {
        showToast('Не удалось загрузить книгу', 'error');
        setLoading(false);
      });
    api.get('/comments')
      .then(res => {
        setComments(Array.isArray(res.data) ? res.data : []);
      });
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDeleteBook = async () => {
    if (!window.confirm('Удалить эту книгу?')) return;
    try {
      await api.delete(`/books/${id}`);
      showToast('Книга успешно удалена', 'success');
      navigate('/books');
    } catch {
      showToast('Не удалось удалить книгу', 'error');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Удалить этот отзыв?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      showToast('Отзыв успешно удалён', 'success');
      loadData();
    } catch {
      showToast('Не удалось удалить отзыв', 'error');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
      Загрузка...
    </div>
  );

  if (!book) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <p>Книга не найдена</p>
      <button onClick={() => navigate('/books')} className="back-btn" style={{ marginTop: '20px' }}>
        ← Вернуться к книгам
      </button>
    </div>
  );

  const bookComments = comments.filter(c => c.bookTitle === book.title);

  const parseRatingsFromStrings = (commentStrings: string[]): number | null => {
    if (!commentStrings || commentStrings.length === 0) return null;
    const ratings: number[] = [];
    commentStrings.forEach(c => {
      const match = c.match(/^\[(\d+)\/10\]/);
      if (match) ratings.push(parseInt(match[1], 10));
    });
    if (ratings.length === 0) return null;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  const avgRating = parseRatingsFromStrings(book.comments);

  return (
    <div className="details-page">
      <button onClick={() => navigate('/books')} className="back-btn">
        <ArrowLeft size={16} style={{ marginRight: '6px' }} />
        Назад к книгам
      </button>

      <div className="book-info-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1>{book.title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
              {book.publicationYear} г. · {book.pages} стр.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f1c40f' }}>
              ⭐ {avgRating !== null ? avgRating.toFixed(1) : '—'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {book.comments.length} отзывов
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="back-btn"
                style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowEditModal(true)}
              >
                <Edit2 size={14} /> Редактировать
              </button>
              <button className="btn-delete" onClick={handleDeleteBook}>
                <Trash2 size={14} /> Удалить
              </button>
            </div>
          </div>
        </div>

        {book.authors && book.authors.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              АВТОРЫ
            </p>
            <div className="authors-tags">
              {book.authors.map((a, i) => (
                <span key={i} className="tag">{a}</span>
              ))}
            </div>
          </div>
        )}

        {book.categories && book.categories.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              КАТЕГОРИИ
            </p>
            <div className="authors-tags">
              {book.categories.map((cat, i) => (
                <span key={i} className="tag tag-green">{cat}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="comments-section" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--accent)" />
            Отзывы — {bookComments.length}
          </h2>
          <button className="btn-primary" onClick={() => { setEditComment(null); setShowCommentModal(true); }}>
            + Добавить отзыв
          </button>
        </div>

        {bookComments.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Отзывов пока нет
          </div>
        ) : (
          bookComments.map(c => (
            <div key={c.id} className="comment-item" style={{ marginBottom: '12px' }}>
              <div className="comment-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <b>{c.userName}</b>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="comment-score">
                    <Star size={16} fill="#f1c40f" color="#f1c40f" style={{ marginRight: '4px' }} />
                    {c.rating} / 10
                  </span>
                  <button
                    className="back-btn"
                    style={{ marginBottom: 0, padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => { setEditComment(c); setShowCommentModal(true); }}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="btn-delete"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="comment-text">"{c.text}"</p>
            </div>
          ))
        )}
      </div>

      {showEditModal && (
        <BookFormModal
          editBook={{
            id: book.id,
            title: book.title,
            pages: book.pages,
            publicationYear: book.publicationYear,
            authorIds: [],
            categoryIds: [],
          }}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadData();
            showToast('Книга успешно обновлена', 'success');
          }}
        />
      )}

      {showCommentModal && (
        <CommentFormModal
          bookTitle={book.title}
          editComment={editComment}
          onClose={() => setShowCommentModal(false)}
          onSuccess={() => {
            setShowCommentModal(false);
            loadData();
            showToast(editComment ? 'Отзыв успешно обновлён' : 'Отзыв успешно добавлен', 'success');
          }}
        />
      )}
    </div>
  );
};

export default BookDetails;