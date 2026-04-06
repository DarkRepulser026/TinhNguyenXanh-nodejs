import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastProps {
  message: string | null;
  type?: ToastType;
  duration?: number; // ms
  onDone?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 2500, onDone }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    setExiting(false);

    const exitTimer = setTimeout(() => setExiting(true), duration);
    const doneTimer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, duration + 350);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [message]);

  if (!visible || !message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        minWidth: '280px',
        maxWidth: '420px',
        background: isSuccess ? '#dcfce7' : '#fee2e2',
        border: `1.5px solid ${isSuccess ? '#86efac' : '#fca5a5'}`,
        borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        animation: exiting ? 'none' : 'toastSlideIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(-18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {isSuccess ? (
        <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0 }} />
      ) : (
        <XCircle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
      )}
      <span style={{ color: isSuccess ? '#15803d' : '#991b1b', fontWeight: 600, fontSize: '0.97rem', lineHeight: 1.4 }}>
        {message}
      </span>
    </div>
  );
};

export default Toast;
