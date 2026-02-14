import React from 'react';
import { useApp } from '../context/AppContext';
import './Toast.css';

const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        {toast.type === 'success' && '✓ '}
        {toast.type === 'error' && '✕ '}
        {toast.type === 'warning' && '⚠ '}
        {toast.type === 'info' && 'ℹ '}
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
