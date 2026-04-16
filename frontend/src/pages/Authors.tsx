import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Author } from '../types';
import { Users, BookOpen, Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editAuthor, setEditAuthor] = useState<Author | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadAuthors = () => {
    api.get('/authors')
      .then((res) => {
        setAuthors(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        showToast('Не удалось загрузить авторов', 'error');
        setLoading(false);
      });
  };

  useEffect(() => { loadAuthors(); }, []);

  const getFullName = (author: Author): string =>
    `${author.firstName || ''} ${author.lastName || ''}`.trim();

  const filteredAuthors = authors.filter((a: Author) =>
    getFullName(a).toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditAuthor(null);
    setFirstName('');
    setLastName('');
    setShowAddForm(true);
  };

  const openEdit = (author: Author, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditAuthor(author);
    setFirstName(author.firstName);
    setLastName(author.lastName);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Удалить автора?')) return;
    try {
      await api.delete(`/authors/${id}`);
      setAuthors(prev => prev.filter(a => a.id !== id));
      showToast('Автор успешно удалён', 'success');
    } catch {
      showToast('Не удалось удалить автора', 'error');
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('Заполните имя и фамилию', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editAuthor) {
        const res = await api.put(`/authors/${editAuthor.id}`, {
          firstName: firstName.trim(),
          lastName: lastName.trim()
        });
        setAuthors(prev => prev.map(a => a.id === editAuthor.id ? res.data : a));
        showToast('Автор успешно обновлён', 'success');
      } else {
        const res = await api.post('/authors', {
          firstName: firstName.trim(),
          lastName: lastName.trim()
        });
        setAuthors(prev => [...prev, res.data]);
        showToast('Автор успешно добавлен', 'success');
      }
      setShowAddForm(false);
    } catch {
      showToast('Ошибка сохранения', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users color="var(--accent)" /> Авторы
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={18} /> Добавить автора
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form" style={{ marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Имя</label>
            <input
              className="form-input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Лев"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Фамилия</label>
            <input
              className="form-input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Толстой"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '...' : (editAuthor ? 'Сохранить' : 'Создать')}
            </button>
            <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setShowAddForm(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : filteredAuthors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          {search ? 'Авторы не найдены' : 'Нет авторов в базе данных'}
        </div>
      ) : (
        <div className="grid">
          {filteredAuthors.map((author: Author) => (
            <div
              key={author.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/authors/${author.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--accent-dim)', border: '1.5px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0,
                }}>
                  {(author.firstName || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{getFullName(author)}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                    ID: {author.id}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="back-btn"
                    style={{ marginBottom: 0, padding: '5px 10px' }}
                    onClick={(e) => openEdit(author, e)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn-delete"
                    style={{ padding: '5px 10px' }}
                    onClick={(e) => handleDelete(author.id, e)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {author.books && author.books.length > 0 && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={12} /> Книги ({author.books.length}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {author.books.slice(0, 3).map((book: string, i: number) => (
                      <span key={i} className="tag" style={{ fontSize: '0.75rem' }}>{book}</span>
                    ))}
                    {author.books.length > 3 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        +{author.books.length - 3}
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

export default Authors;