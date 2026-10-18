import React from 'react';
import { useTickets } from '../context/useTickets';
import { StatusBadge, PriorityBadge } from './Badge';
import { 
  Search, 
  X, 
  Filter, 
  ArrowUpDown, 
  PlusCircle, 
  RotateCcw, 
  Database, 
  Inbox,
  User,
  Calendar
} from 'lucide-react';
import type { Status, Priority, Category, SortOption } from '../types/ticket';

export const TicketListView: React.FC = () => {
  const { 
    tickets, 
    filteredTickets, 
    filterState, 
    setFilterState, 
    resetFilters, 
    setSelectedTicketId, 
    openCreateModal,
    loadDemoData 
  } = useTickets();

  const isFiltered = 
    filterState.searchQuery.trim() !== '' ||
    filterState.status !== 'All' ||
    filterState.priority !== 'All' ||
    filterState.category !== 'All' ||
    filterState.sortBy !== 'newest';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const clearSearch = () => {
    setFilterState((prev) => ({ ...prev, searchQuery: '' }));
  };

  return (
    <div className="view-container ticket-list-view">
      {/* Title & Action */}
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Support Tickets</h1>
          <p className="view-subtitle">
            Manage, triage, and respond to incoming customer inquiries.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
            id="ticket-list-new-ticket-btn"
          >
            <PlusCircle size={18} aria-hidden="true" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-panel" role="search" aria-label="Filter tickets">
        <div className="search-box-wrap">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            className="form-input search-input"
            placeholder="Search by ID, customer name, email, or keywords..."
            value={filterState.searchQuery}
            onChange={handleSearchChange}
            aria-label="Search tickets by ID, customer, or keywords"
          />
          {filterState.searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              aria-label="Clear search input"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="filters-row">
          {/* Status Filter */}
          <div className="filter-group">
            <label htmlFor="filter-status" className="filter-label">
              <Filter size={13} aria-hidden="true" />
              <span>Status</span>
            </label>
            <select
              id="filter-status"
              className="form-select filter-select"
              value={filterState.status}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  status: e.target.value as 'All' | Status,
                }))
              }
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <label htmlFor="filter-priority" className="filter-label">
              <span>Priority</span>
            </label>
            <select
              id="filter-priority"
              className="form-select filter-select"
              value={filterState.priority}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  priority: e.target.value as 'All' | Priority,
                }))
              }
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="filter-category" className="filter-label">
              <span>Category</span>
            </label>
            <select
              id="filter-category"
              className="form-select filter-select"
              value={filterState.category}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  category: e.target.value as 'All' | Category,
                }))
              }
            >
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="General">General</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Account">Account</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group sort-group">
            <label htmlFor="filter-sort" className="filter-label">
              <ArrowUpDown size={13} aria-hidden="true" />
              <span>Sort</span>
            </label>
            <select
              id="filter-sort"
              className="form-select filter-select"
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: e.target.value as SortOption,
                }))
              }
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="updated">Recently Updated</option>
              <option value="priority-desc">Priority: High to Low</option>
              <option value="priority-asc">Priority: Low to High</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              className="btn btn-ghost btn-sm reset-filter-btn"
              onClick={resetFilters}
              title="Reset all search queries and filters"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Summary Results Bar */}
      <div className="tickets-results-meta">
        <span className="results-count">
          Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong> ticket{tickets.length === 1 ? '' : 's'}
        </span>
        {isFiltered && (
          <span className="active-filter-indicator">
            (Filtered view)
          </span>
        )}
      </div>

      {/* Ticket List / Table Content */}
      {filteredTickets.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon-wrap">
            <Inbox size={42} aria-hidden="true" />
          </div>
          {tickets.length === 0 ? (
            <>
              <h4>No Tickets in the System</h4>
              <p>There are no support tickets yet. You can create your first ticket or import sample demo tickets.</p>
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
            </>
          ) : (
            <>
              <h4>No Matching Tickets</h4>
              <p>No tickets match your active search and filter criteria.</p>
              <div className="empty-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetFilters}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-responsive desktop-tickets-table">
            <table className="tickets-table" aria-label="Customer support tickets queue">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '110px' }}>ID</th>
                  <th scope="col" style={{ width: '220px' }}>Customer</th>
                  <th scope="col">Subject & Category</th>
                  <th scope="col" style={{ width: '120px' }}>Priority</th>
                  <th scope="col" style={{ width: '130px' }}>Status</th>
                  <th scope="col" style={{ width: '140px' }}>Created</th>
                  <th scope="col" style={{ width: '90px' }} className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="ticket-row clickable"
                    onClick={() => setSelectedTicketId(t.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTicketId(t.id);
                      }
                    }}
                    aria-label={`Ticket ${t.id}: ${t.subject}. Customer ${t.customerName}. Status ${t.status}. Priority ${t.priority}.`}
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
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(t.id);
                        }}
                        aria-label={`View details for ticket ${t.id}`}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-tickets-cards">
            {filteredTickets.map((t) => (
              <article
                key={t.id}
                className="ticket-mobile-card clickable"
                onClick={() => setSelectedTicketId(t.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTicketId(t.id);
                  }
                }}
              >
                <div className="mobile-card-top">
                  <span className="ticket-id-tag">{t.id}</span>
                  <div className="mobile-card-badges">
                    <PriorityBadge priority={t.priority} size="sm" />
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                </div>

                <h3 className="mobile-card-subject">{t.subject}</h3>

                <div className="mobile-card-meta">
                  <div className="meta-item">
                    <User size={13} aria-hidden="true" />
                    <span>{t.customerName} ({t.customerEmail})</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={13} aria-hidden="true" />
                    <span>
                      {new Date(t.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="ticket-category-pill">{t.category}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
