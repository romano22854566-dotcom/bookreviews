import React from 'react';
import { Book } from '../types';

interface Props {
  book: Book;
  onClick?: () => void;
}

function getBookEmoji(title: string, categories: string[]): string {
  const t = title.toLowerCase();
  const cats = categories.map((c) => c.toLowerCase()).join(' ');
  const all = t + ' ' + cats;

  if (all.includes('война') || all.includes('war')) return '⚔️';
  if (all.includes('мир') || all.includes('peace')) return '🕊️';
  if (all.includes('любовь') || all.includes('love') || all.includes('роман')) return '❤️';
  if (all.includes('преступ') || all.includes('детект') || all.includes('убийст')) return '🔍';
  if (all.includes('фантаст') || all.includes('sci-fi') || all.includes('космос')) return '🚀';
  if (all.includes('фэнтези') || all.includes('fantasy') || all.includes('магия')) return '🧙';
  if (all.includes('истор') || all.includes('history')) return '📜';
  if (all.includes('дети') || all.includes('child') || all.includes('сказк')) return '🧸';
  if (all.includes('приключ') || all.includes('adventure')) return '🗺️';
  if (all.includes('психолог') || all.includes('psychology')) return '🧠';
  if (all.includes('философ')) return '💭';
  if (all.includes('поэзия') || all.includes('стих') || all.includes('poem')) return '🖊️';
  return '📖';
}

function getCoverBg(title: string): string {
  const colors = [
    '#1e1810', 
    '#111820', 
    '#161020',
    '#101a14', 
    '#1a1014', 
    '#181a10', 
    '#201410', 
    '#101818', 
  ];
  const idx = title.charCodeAt(0) % colors.length;
  return colors[idx];
}

function calcRating(comments: string[]): number | null {
  if (!comments || comments.length === 0) return null;
  const ratings: number[] = [];
  comments.forEach((c: string) => {
    const match = c.match(/^\[(\d+)\/10\]/);
    if (match) ratings.push(parseInt(match[1], 10));
  });
  if (ratings.length === 0) return null;
  return ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
}

const BookCard: React.FC<Props> = ({ book, onClick }) => {
  const rating = calcRating(book.comments);
  const authorsText =
    book.authors && book.authors.length > 0
      ? book.authors.join(', ')
      : 'Автор не указан';
  const emoji = getBookEmoji(book.title, book.categories || []);
  const bgColor = getCoverBg(book.title);

  return (
    <div
      className="book-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className="book-cover"
        style={{ background: bgColor }}
      >
        <div className="book-cover-inner">{emoji}</div>
      </div>

      <div className="book-card-body">
        <div className="book-rating">
          ★{' '}
          {rating !== null
            ? `${rating.toFixed(1)} / 10`
            : 'Нет оценок'}
        </div>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-authors">{authorsText}</p>
        <div className="book-meta">
          <span>{book.publicationYear} г.</span>
          {book.pages > 0 && <span>{book.pages} стр.</span>}
        </div>
        {book.categories && book.categories.length > 0 && (
          <div className="book-categories">
            {book.categories.map((cat: string, i: number) => (
              <span key={i} className="category-tag">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;