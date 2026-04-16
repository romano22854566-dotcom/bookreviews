import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Tag, Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Category {
  id: number;
  name: string;
  books?: string[];
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadCategories = () => {
    api.get('/categories')
      .then(res => {
        setCategories(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const openAdd = () => {
    setEditCategory(null);
    setName('');
    setShowForm(true);
  };

  const openEdit = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditCategory(cat);
    setName(cat.name);
    setShowForm(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Удалить жанр?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Жанр успешно удалён', 'success');
    } catch {
      showToast('Не удалось удалить жанр', 'error');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast('Введите название жанра', 'error'); return; }
    setSaving(true);
    try {
      if (editCategory) {
        const res = await api.put(`/categories/${editCategory.id}`, { name: name.trim() });
        setCategories(prev => prev.map(c => c.id === editCategory.id ? res.data : c));
        showToast('Жанр успешно обновлён', 'success');
      } else {
        const res = await api.post('/categories', { name: name.trim() });
        setCategories(prev => [...prev, res.data]);
        showToast('Жанр успешно добавлен', 'success');
      }
      setShowForm(false);
      setEditCategory(null);
      setName('');
    } catch {
      showToast('Ошибка сохранения', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tag color="var(--accent)" /> Жанры
        </h1>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Добавить жанр
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="add-form" style={{ marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Название жанра</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Роман, Фантастика..."
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '...' : (editCategory ? 'Сохранить' : 'Создать')}
            </button>
            <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setShowForm(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Нет жанров в базе данных
        </div>
      ) : (
        <div className="grid">
          {categories.map(cat => (
            <div key={cat.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: 'var(--green-bg)', border: '1.5px solid var(--green-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0,
                  }}>
                    🏷️
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{cat.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                      ID: {cat.id}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="back-btn"
                    style={{ marginBottom: 0, padding: '5px 10px' }}
                    onClick={(e) => openEdit(cat, e)}
                    title="Редактировать"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn-delete"
                    style={{ padding: '5px 10px' }}
                    onClick={(e) => handleDelete(cat.id, e)}
                    title="Удалить"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {cat.books && cat.books.length > 0 && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '6px' }}>
                    Книги ({cat.books.length}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {cat.books.slice(0, 3).map((b, i) => (
                      <span key={i} className="tag tag-green" style={{ fontSize: '0.72rem' }}>{b}</span>
                    ))}
                    {cat.books.length > 3 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        +{cat.books.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;