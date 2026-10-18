import React from 'react';
import { useTickets } from '../context/useTickets';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useTickets();

  if (!toastMessage) return null;

  return (
    <div 
      className="toast-notification"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 size={18} className="toast-icon" aria-hidden="true" />
      <span className="toast-text">{toastMessage}</span>
    </div>
  );
};
