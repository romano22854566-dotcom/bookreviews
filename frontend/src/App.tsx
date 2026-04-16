import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Authors from './pages/Authors';
import AuthorDetails from './pages/AuthorDetails';
import Categories from './pages/Categories';
import Comments from './pages/Comments';
import CommentDetails from './pages/CommentDetails';
import Users from './pages/Users';
import Logs from './pages/Logs';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="authors" element={<Authors />} />
          <Route path="authors/:id" element={<AuthorDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="comments" element={<Comments />} />
          <Route path="comments/:id" element={<CommentDetails />} />
          <Route path="users" element={<Users />} />
          <Route path="logs" element={<Logs />} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;