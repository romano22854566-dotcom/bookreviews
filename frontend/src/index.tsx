import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { ToastProvider } from './context/ToastContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);