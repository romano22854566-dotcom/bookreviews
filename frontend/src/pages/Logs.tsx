import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Log } from '../types';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/logs')
      .then((res) => {
        setLogs(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки логов:', err);
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle size={16} color="#27ae60" />;
      case 'FAILURE':
        return <XCircle size={16} color="#e74c3c" />;
      case 'IN_PROGRESS':
        return <Clock size={16} color="#f39c12" />;
      default:
        return <FileText size={16} color="#888" />;
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'SUCCESS':
        return '#e8f5e9';
      case 'FAILURE':
        return '#ffebee';
      case 'IN_PROGRESS':
        return '#fff8e1';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="#646cff" /> Журнал действий
        </h1>
        <span style={{ color: '#888', fontSize: '0.9rem' }}>
          {logs.length} записей
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          Загрузка...
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <table className="logs-table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Пользователь</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#888',
                    }}
                  >
                    Логов пока нет
                  </td>
                </tr>
              ) : (
                logs.map((log: Log) => (
                  <tr key={log.id}>
                    <td
                      style={{
                        whiteSpace: 'nowrap',
                        color: '#888',
                        fontSize: '0.85rem',
                      }}
                    >
                      {log.date || '—'}
                    </td>
                    <td>
                      <span className="user-badge">
                        {log.username || 'Система'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: getStatusBg(log.status),
                        }}
                      >
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td>{log.body || '—'}</td>
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

export default Logs;