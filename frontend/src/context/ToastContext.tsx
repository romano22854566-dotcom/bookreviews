import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const getToastStyle = (type: ToastType): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '12px 20px',
      borderRadius: '10px',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '500',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '280px',
      animation: 'slideIn 0.3s ease',
      fontFamily: 'Inter, sans-serif',
    };
    switch (type) {
      case 'success': return { ...base, background: '#27ae60', border: '1px solid #2ecc71' };
      case 'error':   return { ...base, background: '#c0392b', border: '1px solid #e74c3c' };
      case 'info':    return { ...base, background: '#2980b9', border: '1px solid #3498db' };
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✅';
      case 'error':   return '❌';
      case 'info':    return 'ℹ️';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={getToastStyle(toast.type)}>
            <span>{getIcon(toast.type)}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};