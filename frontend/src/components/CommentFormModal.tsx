import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Comment } from '../types';
import { X } from 'lucide-react';

interface User {
  id: number;
  name: string;
}

interface Props {
  bookTitle: string;
  editComment?: Comment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CommentFormModal: React.FC<Props> = ({ bookTitle, editComment, onClose, onSuccess }) => {
  const [text, setText] = useState(editComment?.text || '');
  const [rating, setRating] = useState<number>(editComment?.rating || 5);
  const [userId, setUserId] = useState<number | ''>('');
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
      if (list.length > 0 && !editComment) setUserId(list[0].id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) { setError('Введите текст отзыва'); return; }
    if (!editComment && !userId) { setError('Выберите пользователя'); return; }
    setSaving(true);
    setError('');
    try {
      if (editComment) {
        // При редактировании передаём те же bookId/userId
        await api.put(`/comments/${editComment.id}`, {
          text: text.trim(),
          rating,
          bookId: 0, 
          userId: 0,
        });
      } else {
        
        const booksRes = await api.get('/books');
        const books = Array.isArray(booksRes.data) ? booksRes.data : [];
        const book = books.find((b: any) => b.title === bookTitle);
        if (!book) { setError('Книга не найдена'); setSaving(false); return; }
        await api.post('/comments', {
          text: text.trim(),
          rating,
          bookId: book.id,
          userId,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка сохранения');
    }
    setSaving(false);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            {editComment ? 'Редактировать отзыв' : 'Добавить отзыв'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#e57373', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Книга</label>
          <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {bookTitle}
          </div>
        </div>

        {!editComment && (
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Пользователь</label>
            <select
              className="form-select"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Оценка: {rating} / 10</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                style={{
                  width: '40px', height: '36px',
                  borderRadius: '8px',
                  border: rating === r ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: rating === r ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  color: rating === r ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: rating === r ? '700' : '400',
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Текст отзыва</label>
          <textarea
            className="form-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите ваш отзыв..."
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="back-btn" style={{ marginBottom: 0 }}>Отмена</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : (editComment ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '28px',
  width: '500px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default CommentFormModal;