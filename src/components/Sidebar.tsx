import React from 'react';
import { useTickets } from '../context/useTickets';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  Database, 
  Trash2, 
  Headphones, 
  HardDrive,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeView, 
    setActiveView, 
    setSelectedTicketId, 
    openCreateModal, 
    loadDemoData, 
    clearAllTickets, 
    metrics,
    storageStatus
  } = useTickets();

  const handleNav = (view: 'dashboard' | 'tickets') => {
    setActiveView(view);
    setSelectedTicketId(null);
    onCloseMobile();
  };

  const handleOpenCreate = () => {
    openCreateModal();
    onCloseMobile();
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all tickets and messages from your local browser storage? This cannot be undone.'
    );
    if (confirmed) {
      clearAllTickets();
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobile} 
          aria-hidden="true" 
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`} aria-label="Main navigation">
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <Headphones size={22} aria-hidden="true" />
          </div>
          <div className="sidebar-brand-text">
            <span className="brand-title">HelpDesk Lite</span>
            <span className="brand-subtitle">Support Workspace</span>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={onCloseMobile} 
            aria-label="Close menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Primary CTA */}
        <div className="sidebar-cta-wrap">
          <button 
            type="button" 
            className="btn btn-primary btn-block sidebar-create-btn"
            onClick={handleOpenCreate}
            id="sidebar-new-ticket-btn"
          >
            <PlusCircle size={18} aria-hidden="true" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('dashboard')}
                aria-current={activeView === 'dashboard' ? 'page' : undefined}
              >
                <LayoutDashboard size={18} aria-hidden="true" />
                <span className="nav-label">Dashboard</span>
                {metrics.total > 0 && (
                  <span className="nav-counter" aria-label={`${metrics.total} total tickets`}>
                    {metrics.total}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`sidebar-nav-item ${activeView === 'tickets' ? 'active' : ''}`}
                onClick={() => handleNav('tickets')}
                aria-current={activeView === 'tickets' ? 'page' : undefined}
              >
                <Ticket size={18} aria-hidden="true" />
                <span className="nav-label">All Tickets</span>
                {metrics.open > 0 && (
                  <span className="nav-counter nav-counter-open" aria-label={`${metrics.open} open tickets`}>
                    {metrics.open}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Demo Data Management Section */}
        <div className="sidebar-section demo-section">
          <div className="sidebar-section-header">
            <Database size={14} aria-hidden="true" />
            <span>SAMPLE DATA</span>
          </div>
          <p className="sidebar-section-desc">
            Load realistic support tickets. Existing tickets are never replaced.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-block demo-load-btn"
            onClick={() => {
              loadDemoData();
              onCloseMobile();
            }}
          >
            Load Demo Tickets
          </button>
        </div>

        {/* Local Storage & Prototype Footer */}
        <div className="sidebar-footer">
          <div className="storage-indicator">
            <HardDrive size={14} aria-hidden="true" />
            <div className="storage-text">
              <span className="storage-status-line">
                <span className={`status-dot ${storageStatus.isAvailable ? 'dot-active' : 'dot-warning'}`} />
                {storageStatus.isAvailable ? 'localStorage Active' : 'Memory Only'}
              </span>
              <span className="storage-scope-note">Local single-user prototype</span>
            </div>
          </div>

          {metrics.total > 0 && (
            <button
              type="button"
              className="sidebar-clear-btn"
              onClick={handleClear}
              title="Clear all tickets and reset localStorage"
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Clear Local Data</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
