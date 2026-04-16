import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Author, Book } from '../types';
import { ArrowLeft, BookOpen } from 'lucide-react';

const AuthorDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<Author | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const getFullName = (a: Author): string =>
    `${a.firstName || ''} ${a.lastName || ''}`.trim();

  useEffect(() => {
    Promise.all([
      api.get(`/authors/${id}`),
      api.get('/books'),
    ])
      .then(([authorRes, booksRes]) => {
        setAuthor(authorRes.data);
        setAllBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки:', err);
        setLoading(false);
      });
  }, [id]);

  const filteredBooks: Book[] = author
    ? allBooks.filter((b: Book) =>
        b.authors.some(
          (aName: string) =>
            aName
              .toLowerCase()
              .includes((author.lastName || '').toLowerCase()) ||
            aName
              .toLowerCase()
              .includes((author.firstName || '').toLowerCase())
        )
      )
    : [];

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

  if (!author)
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p>Автор не найден</p>
        <button
          onClick={() => navigate('/authors')}
          className="back-btn"
          style={{ marginTop: '20px' }}
        >
          ← Вернуться к авторам
        </button>
      </div>
    );

  return (
    <div className="details-page">
      <button onClick={() => navigate('/authors')} className="back-btn">
        <ArrowLeft size={16} style={{ marginRight: '6px' }} />
        Назад к авторам
      </button>

      <div className="book-info-header">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#646cff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '2rem',
              flexShrink: 0,
            }}
          >
            {(author.firstName || '?')[0].toUpperCase()}
          </div>
          <div>
            <h1>{getFullName(author)}</h1>
            <p style={{ color: '#888', marginTop: '4px' }}>
              ID: {author.id}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <BookOpen size={20} color="#646cff" />
          Книги автора ({filteredBooks.length})
        </h2>

        {filteredBooks.length === 0 ? (
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            Книги не найдены
          </div>
        ) : (
          <div
            className="grid"
          >
            {filteredBooks.map((book: Book) => (
              <div
                key={book.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <h3>{book.title}</h3>
                <p style={{ color: '#888', margin: '6px 0' }}>
                  {book.publicationYear} г.
                </p>
                {book.categories && book.categories.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginTop: '8px',
                    }}
                  >
                    {book.categories.map((cat: string, i: number) => (
                      <span
                        key={i}
                        className="tag"
                        style={{
                          fontSize: '0.75rem',
                          background: '#e8f5e9',
                          color: '#2e7d32',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDetails;