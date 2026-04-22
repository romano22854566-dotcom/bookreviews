import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { User } from '../types';
import { Shield, Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const loadUsers = () => {
    api.get('/users')
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        showToast('Не удалось загрузить пользователей', 'error');
        setLoading(false);
      });
  };

  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice(
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Точно удалить пользователя?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('Пользователь успешно удалён', 'success');
    } catch {
      showToast('Не удалось удалить пользователя', 'error');
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      showToast('Введите имя пользователя', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/users', { name: newName.trim(), role: newRole });
      setUsers(prev => [...prev, res.data]);
      setNewName('');
      setNewRole('USER');
      setShowAddForm(false);
      showToast('Пользователь успешно создан', 'success');
    } catch {
      showToast('Не удалось создать пользователя', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield color="#646cff" /> Управление пользователями
        </h1>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#646cff', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <UserPlus size={18} />
          {showAddForm ? 'Отмена' : 'Добавить'}
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'flex', gap: '12px', alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', marginBottom: '6px' }}>
              ИМЯ ПОЛЬЗОВАТЕЛЯ
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Введите имя..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #eee', fontSize: '1rem', outline: 'none'
              }}
              onKeyPress={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', marginBottom: '6px' }}>
              РОЛЬ
            </label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as 'USER' | 'ADMIN')}
              style={{
                padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #eee', fontSize: '1rem', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            style={{
              background: '#27ae60', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '1rem'
            }}
          >
            {saving ? 'Сохранение...' : 'Создать'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Загрузка...</div>
      ) : (
        <>
          {users.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Показано {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, users.length)} из {users.length} пользователей
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

          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      Нет пользователей
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(user => (
                    <tr key={user.id}>
                      <td style={{ color: '#888', fontSize: '0.9rem' }}>#{user.id}</td>
                      <td style={{ fontWeight: '500' }}>{user.name}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={14} />
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

export default Users;