import React from 'react';
import { useTickets } from '../context/useTickets';
import { Menu, Plus, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { activeView, selectedTicket, setActiveView, setSelectedTicketId, openCreateModal } = useTickets();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => {
                  setActiveView('dashboard');
                  setSelectedTicketId(null);
                }}
              >
                HelpDesk
              </button>
            </li>

            <li className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight size={14} />
            </li>

            {selectedTicket ? (
              <>
                <li className="breadcrumb-item">
                  <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => {
                      setActiveView('tickets');
                      setSelectedTicketId(null);
                    }}
                  >
                    Tickets
                  </button>
                </li>
                <li className="breadcrumb-separator" aria-hidden="true">
                  <ChevronRight size={14} />
                </li>
                <li className="breadcrumb-item breadcrumb-current" aria-current="page">
                  {selectedTicket.id}
                </li>
              </>
            ) : (
              <li className="breadcrumb-item breadcrumb-current" aria-current="page">
                {activeView === 'dashboard' ? 'Dashboard Overview' : 'Ticket Queue'}
              </li>
            )}
          </ol>
        </nav>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="btn btn-primary btn-sm header-action-btn"
          onClick={openCreateModal}
          id="header-create-ticket-btn"
        >
          <Plus size={16} aria-hidden="true" />
          <span>New Ticket</span>
        </button>
      </div>
    </header>
  );
};
