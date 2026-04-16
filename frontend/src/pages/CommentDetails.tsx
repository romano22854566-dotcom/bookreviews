import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Comment, Book } from '../types';
import { ArrowLeft, Star, User, BookOpen } from 'lucide-react';

const CommentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/comments/${id}`)
      .then((res) => {
        setComment(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки отзыва:', err);
        setLoading(false);
      });
  }, [id]);

  const handleBookClick = () => {
    if (!comment) return;
    api
      .get('/books')
      .then((res) => {
        const books: Book[] = Array.isArray(res.data) ? res.data : [];
        const found = books.find((b: Book) => b.title === comment.bookTitle);
        if (found) {
          navigate(`/books/${found.id}`);
        }
      })
      .catch(console.error);
  };

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          color: '#888',
        }}
      >
        Загрузка...
      </div>
    );

  if (!comment)
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p>Отзыв не найден</p>
        <button
          onClick={() => navigate('/comments')}
          className="back-btn"
          style={{ marginTop: '20px' }}
        >
          ← Назад к отзывам
        </button>
      </div>
    );

  return (
    <div className="details-page">
      <button onClick={() => navigate('/comments')} className="back-btn">
        <ArrowLeft size={16} style={{ marginRight: '6px' }} />
        Назад к отзывам
      </button>

      <div className="book-info-header" style={{ marginTop: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
          Отзыв #{comment.id}
        </h1>

        {/* Книга — кликабельная */}
        <div
          onClick={handleBookClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: '#f0f0ff',
            borderRadius: '10px',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'background 0.2s',
          }}
        >
          <BookOpen size={22} color="#646cff" />
          <div>
            <p
              style={{
                color: '#888',
                fontSize: '0.72rem',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Книга (нажмите чтобы открыть)
            </p>
            <p
              style={{ fontWeight: 'bold', margin: 0, color: '#646cff' }}
            >
              {comment.bookTitle}
            </p>
          </div>
        </div>

        {/* Автор отзыва */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: '#f5f5f5',
            borderRadius: '10px',
            marginBottom: '12px',
          }}
        >
          <User size={22} color="#666" />
          <div>
            <p
              style={{
                color: '#888',
                fontSize: '0.72rem',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Автор отзыва
            </p>
            <p style={{ fontWeight: 'bold', margin: 0 }}>
              {comment.userName}
            </p>
          </div>
        </div>

        {/* Рейтинг */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: '#fff8e1',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <Star size={22} fill="#f1c40f" color="#f1c40f" />
          <div>
            <p
              style={{
                color: '#888',
                fontSize: '0.72rem',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Оценка
            </p>
            <p
              style={{
                fontWeight: 'bold',
                margin: 0,
                fontSize: '1.3rem',
              }}
            >
              {comment.rating} / 10
            </p>
          </div>
        </div>

        {/* Текст отзыва */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            borderLeft: '4px solid #646cff',
          }}
        >
          <p
            style={{
              color: '#888',
              fontSize: '0.75rem',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Текст отзыва
          </p>
          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: '#333',
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            "{comment.text}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommentDetails;