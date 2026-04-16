import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { User } from '../types';
import { Shield, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

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
                users.map(user => (
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
      )}
    </div>
  );
};

export default Users;