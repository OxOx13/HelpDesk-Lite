import React from 'react';
import { useTickets } from '../context/useTickets';
import { StatusBadge, PriorityBadge } from './Badge';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Layers, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Database
} from 'lucide-react';
import type { Status } from '../types/ticket';

export const DashboardView: React.FC = () => {
  const { 
    tickets, 
    metrics, 
    setActiveView, 
    setSelectedTicketId, 
    setFilterState, 
    openCreateModal,
    loadDemoData 
  } = useTickets();

  const handleFilterToStatus = (status: Status | 'All') => {
    setFilterState((prev) => ({
      ...prev,
      status,
      searchQuery: '',
      priority: 'All',
      category: 'All',
    }));
    setActiveView('tickets');
    setSelectedTicketId(null);
  };

  const handleViewTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveView('tickets');
  };

  // Recent 5 tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="view-container dashboard-view">
      {/* Welcome & action header */}
      <div className="dashboard-header">
        <div>
          <h1 className="view-title">Support Dashboard</h1>
          <p className="view-subtitle">
            Overview of live customer support volume, resolution statuses, and urgent inquiries.
          </p>
        </div>
        <div className="dashboard-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            <PlusCircle size={18} aria-hidden="true" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid" role="region" aria-label="Support ticket statistics">
        {/* Total Tickets */}
        <div 
          className="metric-card metric-card-total clickable"
          onClick={() => handleFilterToStatus('All')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFilterToStatus('All'); }}
          aria-label={`Total tickets: ${metrics.total}. Click to view all tickets.`}
        >
          <div className="metric-header">
            <span className="metric-title">Total Volume</span>
            <div className="metric-icon-wrap total-icon">
              <Layers size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-footer">
            <span className="metric-label">All recorded tickets</span>
            <span className="metric-link">View all &rarr;</span>
          </div>
        </div>

        {/* Open Tickets */}
        <div 
          className="metric-card metric-card-open clickable"
          onClick={() => handleFilterToStatus('Open')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFilterToStatus('Open'); }}
          aria-label={`Open tickets: ${metrics.open}. Click to filter open tickets.`}
        >
          <div className="metric-header">
            <span className="metric-title">Open Tickets</span>
            <div className="metric-icon-wrap open-icon">
              <Inbox size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="metric-value">{metrics.open}</div>
          <div className="metric-footer">
            <span className="metric-label">Awaiting initial action</span>
            <span className="metric-link">Filter open &rarr;</span>
          </div>
        </div>

        {/* In Progress Tickets */}
        <div 
          className="metric-card metric-card-progress clickable"
          onClick={() => handleFilterToStatus('In Progress')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFilterToStatus('In Progress'); }}
          aria-label={`In Progress tickets: ${metrics.inProgress}. Click to filter in-progress tickets.`}
        >
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon-wrap progress-icon">
              <Clock size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="metric-value">{metrics.inProgress}</div>
          <div className="metric-footer">
            <span className="metric-label">Under investigation</span>
            <span className="metric-link">Filter active &rarr;</span>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div 
          className="metric-card metric-card-resolved clickable"
          onClick={() => handleFilterToStatus('Resolved')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFilterToStatus('Resolved'); }}
          aria-label={`Resolved tickets: ${metrics.resolved}. Click to filter resolved tickets.`}
        >
          <div className="metric-header">
            <span className="metric-title">Resolved</span>
            <div className="metric-icon-wrap resolved-icon">
              <CheckCircle2 size={18} aria-hidden="true" />
            </div>
          </div>
          <div className="metric-value">{metrics.resolved}</div>
          <div className="metric-footer">
            <span className="metric-label">Successfully closed</span>
            <span className="metric-link">Filter closed &rarr;</span>
          </div>
        </div>
      </div>

      {/* Priority Breakdown Banner */}
      <div className="dashboard-section priority-summary-panel">
        <div className="priority-summary-header">
          <div className="priority-title-wrap">
            <TrendingUp size={18} aria-hidden="true" className="accent-teal-icon" />
            <h3>Urgency & Priority Distribution</h3>
          </div>
          <span className="priority-summary-hint">
            {metrics.highPriority} high priority item{metrics.highPriority === 1 ? '' : 's'} require immediate focus
          </span>
        </div>

        <div className="priority-chips">
          <div 
            className="priority-chip chip-high clickable"
            onClick={() => {
              setFilterState((prev) => ({ ...prev, priority: 'High', status: 'All' }));
              setActiveView('tickets');
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setFilterState((prev) => ({ ...prev, priority: 'High', status: 'All' }));
                setActiveView('tickets');
              }
            }}
          >
            <div className="chip-indicator indicator-high" />
            <span className="chip-label">High Priority</span>
            <span className="chip-count">{metrics.highPriority}</span>
          </div>

          <div 
            className="priority-chip chip-med clickable"
            onClick={() => {
              setFilterState((prev) => ({ ...prev, priority: 'Medium', status: 'All' }));
              setActiveView('tickets');
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setFilterState((prev) => ({ ...prev, priority: 'Medium', status: 'All' }));
                setActiveView('tickets');
              }
            }}
          >
            <div className="chip-indicator indicator-med" />
            <span className="chip-label">Medium Priority</span>
            <span className="chip-count">{metrics.mediumPriority}</span>
          </div>

          <div 
            className="priority-chip chip-low clickable"
            onClick={() => {
              setFilterState((prev) => ({ ...prev, priority: 'Low', status: 'All' }));
              setActiveView('tickets');
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setFilterState((prev) => ({ ...prev, priority: 'Low', status: 'All' }));
                setActiveView('tickets');
              }
            }}
          >
            <div className="chip-indicator indicator-low" />
            <span className="chip-label">Low Priority</span>
            <span className="chip-count">{metrics.lowPriority}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity / Ticket Table Preview */}
      <div className="dashboard-section recent-tickets-section">
        <div className="section-header-row">
          <div>
            <h3>Recent Tickets</h3>
            <p className="section-desc">Latest inquiries logged in the support portal.</p>
          </div>
          {tickets.length > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setActiveView('tickets');
                setSelectedTicketId(null);
              }}
            >
              <span>View All Tickets ({tickets.length})</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {recentTickets.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon-wrap">
              <Inbox size={40} aria-hidden="true" />
            </div>
            <h4>No Tickets Yet</h4>
            <p>Your support queue is completely clean! You can create a new ticket or load sample demo data.</p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateModal}
              >
                <PlusCircle size={16} aria-hidden="true" />
                <span>Create First Ticket</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadDemoData}
              >
                <Database size={16} aria-hidden="true" />
                <span>Load Sample Demo Data</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="tickets-table" aria-label="Recent tickets">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '110px' }}>ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Subject</th>
                  <th scope="col" style={{ width: '110px' }}>Priority</th>
                  <th scope="col" style={{ width: '130px' }}>Status</th>
                  <th scope="col" style={{ width: '130px' }}>Created</th>
                  <th scope="col" style={{ width: '90px' }} className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr 
                    key={t.id} 
                    className="ticket-row clickable"
                    onClick={() => handleViewTicket(t.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleViewTicket(t.id);
                      }
                    }}
                  >
                    <td>
                      <span className="ticket-id-tag">{t.id}</span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{t.customerName}</span>
                        <span className="customer-email">{t.customerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="subject-cell">
                        <span className="ticket-subject">{t.subject}</span>
                        <span className="ticket-category-pill">{t.category}</span>
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={t.priority} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td>
                      <span className="timestamp-text" title={new Date(t.createdAt).toLocaleString()}>
                        {new Date(t.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTicket(t.id);
                        }}
                        aria-label={`Open ticket ${t.id}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
