import React from 'react';
import { useTickets } from '../context/useTickets';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export const StorageNotice: React.FC = () => {
  const { storageStatus, dismissStorageNotice } = useTickets();

  if (!storageStatus.error && !storageStatus.warning) {
    return null;
  }

  const isError = Boolean(storageStatus.error);
  const message = storageStatus.error || storageStatus.warning;

  return (
    <aside 
      className={`storage-banner ${isError ? 'storage-banner-error' : 'storage-banner-warning'}`}
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className="storage-banner-content">
        {isError ? (
          <AlertCircle className="storage-banner-icon" size={18} aria-hidden="true" />
        ) : (
          <AlertTriangle className="storage-banner-icon" size={18} aria-hidden="true" />
        )}
        <span className="storage-banner-text">{message}</span>
      </div>
      <button
        type="button"
        className="storage-banner-close"
        onClick={dismissStorageNotice}
        aria-label="Dismiss storage notice"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
};
