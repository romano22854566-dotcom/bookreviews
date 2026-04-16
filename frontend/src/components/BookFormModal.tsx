import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Author } from '../types';
import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editBook?: {
    id: number;
    title: string;
    pages: number;
    publicationYear: number;
    authorIds: number[];
    categoryIds: number[];
  };
}

interface Category {
  id: number;
  name: string;
}

const BookFormModal: React.FC<Props> = ({ onClose, onSuccess, editBook }) => {
  const [title, setTitle] = useState(editBook?.title || '');
  const [pages, setPages] = useState(editBook?.pages?.toString() || '');
  const [year, setYear] = useState(editBook?.publicationYear?.toString() || '');
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>(editBook?.authorIds || []);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(editBook?.categoryIds || []);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([api.get('/authors'), api.get('/categories')]).then(
      ([aRes, cRes]) => {
        setAuthors(Array.isArray(aRes.data) ? aRes.data : []);
        setCategories(Array.isArray(cRes.data) ? cRes.data : []);
      }
    ).catch(() => {
      showToast('Не удалось загрузить данные формы', 'error');
    });
  }, []);

  const toggleAuthor = (id: number) => {
    setSelectedAuthorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Введите название книги'); return; }
    if (!pages || Number(pages) < 1) { setError('Введите количество страниц (> 0)'); return; }
    if (!year || Number(year) < 1440 || Number(year) > 2026) {
      setError('Год публикации: от 1440 до 2026'); return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        pages: Number(pages),
        publicationYear: Number(year),
        authorIds: selectedAuthorIds,
        categoryIds: selectedCategoryIds,
      };
      if (editBook) {
        await api.put(`/books/${editBook.id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Ошибка сохранения';
      setError(msg);
      showToast(msg, 'error');
    }
    setSaving(false);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            {editBook ? 'Редактировать книгу' : 'Добавить книгу'}
          </h2>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#e57373', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Название</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название книги..."
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Страниц</label>
            <input
              className="form-input"
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="300"
              min={1}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Год публикации</label>
            <input
              className="form-input"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
              min={1440}
              max={2026}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Авторы</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {authors.map((a) => {
              const selected = selectedAuthorIds.includes(a.id);
              return (
                <span
                  key={a.id}
                  onClick={() => toggleAuthor(a.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selected ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {a.firstName} {a.lastName}
                </span>
              );
            })}
            {authors.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Авторы не найдены</span>}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Категории</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {categories.map((c) => {
              const selected = selectedCategoryIds.includes(c.id);
              return (
                <span
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    border: selected ? '1px solid var(--green-color)' : '1px solid var(--border)',
                    background: selected ? 'var(--green-bg)' : 'var(--bg-elevated)',
                    color: selected ? 'var(--green-color)' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.name}
                </span>
              );
            })}
            {categories.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Категории не найдены</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="back-btn" style={{ marginBottom: 0 }}>
            Отмена
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : (editBook ? 'Сохранить' : 'Создать')}
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
  width: '560px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none',
  color: 'var(--text-muted)', cursor: 'pointer',
  padding: '4px', borderRadius: '6px',
};

export default BookFormModal;