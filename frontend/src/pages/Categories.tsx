import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Tag, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Category {
  id: number;
  name: string;
  books?: string[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const totalPages = Math.ceil(categories.length / pageSize);
  const paginatedCategories = categories.slice(
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
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Показано {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, categories.length)} из {categories.length} жанров
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
            {paginatedCategories.map(cat => (
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

export default Categories;