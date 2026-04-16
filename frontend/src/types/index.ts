export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  role: Role;
  comments?: string[];
}

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  books?: string[];
}

export interface Comment {
  id: number;
  text: string;
  rating: number;
  bookTitle: string;
  userName: string;
}

export interface Book {
  id: number;
  title: string;
  pages: number;
  publicationYear: number;
  authors: string[];
  categories: string[];
  comments: string[];
}

export interface Log {
  id: number;
  status: string;
  date: string;
  body: string;
  username: string;
}

export interface Category {
  id: number;
  name: string;
}