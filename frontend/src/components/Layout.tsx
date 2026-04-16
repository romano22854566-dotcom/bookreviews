import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  BookOpen,
  Users,
  MessageSquare,
  Shield,
  FileText,
  Library,
  Tag,
} from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">BookReviews</span>
        </div>

        <nav className="menu">
          <NavLink to="/books" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <Library size={18} /> Книги
          </NavLink>

          <NavLink to="/authors" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} /> Авторы
          </NavLink>

          {/* ВОТ НОВЫЙ ПУНКТ — Жанры */}
          <NavLink to="/categories" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <Tag size={18} /> Жанры
          </NavLink>

          <NavLink to="/comments" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} /> Отзывы
          </NavLink>

          <div className="admin-divider">Панель администратора</div>

          <NavLink to="/users" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <Users size={18} /> Пользователи
          </NavLink>

          <NavLink to="/logs" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Логи
          </NavLink>
        </nav>

        <div className="user-panel">
          <div className="user-avatar">Р</div>
          <div>
            <p className="user-name">Роман</p>
            <p className="user-status">Administrator</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;