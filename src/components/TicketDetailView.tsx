import React, { useState, useEffect } from 'react';
import { useTickets } from '../context/useTickets';
import { StatusBadge, PriorityBadge, CategoryBadge, MessageTypeBadge } from './Badge';
import { 
  ArrowLeft, 
  Send, 
  Lock, 
  MessageSquare, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Info,
  ShieldAlert
} from 'lucide-react';
import type { Status, MessageType, AuthorRole } from '../types/ticket';

export const TicketDetailView: React.FC = () => {
  const { 
    selectedTicket, 
    selectedTicketMessages, 
    setSelectedTicketId, 
    updateTicketStatus, 
    addMessage
  } = useTickets();

  const [messageType, setMessageType] = useState<MessageType>('reply');
  const [authorName, setAuthorName] = useState('Alex (Support Agent)');
  const [authorRole, setAuthorRole] = useState<AuthorRole>('agent');
  const [messageBody, setMessageBody] = useState('');
  const [nextStatus, setNextStatus] = useState<Status | 'keep'>('keep');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Keyboard navigation: Escape returns to list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setSelectedTicketId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedTicketId, isSubmitting]);

  if (!selectedTicket) {
    return (
      <div className="view-container">
        <div className="empty-state-box">
          <p>Ticket not found or has been removed.</p>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setSelectedTicketId(null)}
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    updateTicketStatus(selectedTicket.id, newStatus);
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      setFormError('Please enter a message before sending.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const result = addMessage({
      ticketId: selectedTicket.id,
      type: messageType,
      author: authorName.trim() || (authorRole === 'agent' ? 'Support Agent' : 'Customer'),
      authorRole: authorRole,
      body: messageBody.trim(),
    });

    if (result.success) {
      setMessageBody('');
      // Apply status change if selected
      if (nextStatus !== 'keep' && nextStatus !== selectedTicket.status) {
        updateTicketStatus(selectedTicket.id, nextStatus);
      }
    } else {
      setFormError(result.error || 'Failed to submit message.');
    }

    setIsSubmitting(false);
  };

  const handleKeyDownComposer = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitMessage(e);
    }
  };

  return (
    <div className="view-container ticket-detail-view">
      {/* Top action navigation */}
      <div className="detail-top-nav">
        <button
          type="button"
          className="btn btn-ghost btn-sm back-link-btn"
          onClick={() => setSelectedTicketId(null)}
          aria-label="Back to all tickets (or press Escape)"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Tickets</span>
        </button>

        <div className="detail-quick-status">
          <label htmlFor="ticket-status-selector" className="quick-status-label">
            Change Status:
          </label>
          <select
            id="ticket-status-selector"
            className="form-select status-select-field"
            value={selectedTicket.status}
            onChange={handleStatusSelect}
            aria-label={`Current status is ${selectedTicket.status}. Select to change.`}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Ticket Card Header */}
      <div className="ticket-detail-hero">
        <div className="ticket-hero-primary">
          <div className="ticket-hero-tags">
            <span className="ticket-id-large">{selectedTicket.id}</span>
            <StatusBadge status={selectedTicket.status} />
            <PriorityBadge priority={selectedTicket.priority} />
            <CategoryBadge category={selectedTicket.category} />
          </div>
          <h1 className="ticket-hero-title">{selectedTicket.subject}</h1>
        </div>

        {/* Customer Information Panel */}
        <div className="customer-info-strip">
          <div className="customer-info-item">
            <User size={15} className="info-icon" aria-hidden="true" />
            <span className="info-label">Customer:</span>
            <strong className="info-value">{selectedTicket.customerName}</strong>
          </div>

          <div className="customer-info-item">
            <Mail size={15} className="info-icon" aria-hidden="true" />
            <span className="info-label">Email:</span>
            <a 
              href={`mailto:${selectedTicket.customerEmail}`} 
              className="info-link"
              title="Click to draft external email client"
            >
              {selectedTicket.customerEmail}
            </a>
          </div>

          <div className="customer-info-item">
            <Calendar size={15} className="info-icon" aria-hidden="true" />
            <span className="info-label">Submitted:</span>
            <span className="info-value">
              {new Date(selectedTicket.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="customer-info-item">
            <Clock size={15} className="info-icon" aria-hidden="true" />
            <span className="info-label">Last Active:</span>
            <span className="info-value">
              {new Date(selectedTicket.updatedAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Original Customer Report Card */}
      <section className="inquiry-card" aria-label="Original ticket inquiry">
        <div className="inquiry-header">
          <div className="inquiry-header-left">
            <div className="avatar-circle customer-avatar">
              {selectedTicket.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="inquiry-author">{selectedTicket.customerName}</span>
              <span className="inquiry-role-pill">Ticket Submitter</span>
            </div>
          </div>
          <time className="inquiry-time" dateTime={selectedTicket.createdAt}>
            {new Date(selectedTicket.createdAt).toLocaleString()}
          </time>
        </div>
        <div className="inquiry-body">
          <p>{selectedTicket.description}</p>
        </div>
      </section>

      {/* Conversation Thread */}
      <section className="conversation-section" aria-label="Conversation and internal notes">
        <div className="conversation-header">
          <h2>Activity & Conversation ({selectedTicketMessages.length})</h2>
          <span className="thread-privacy-note">
            <Info size={14} aria-hidden="true" />
            <span>Internal notes are highlighted in amber and separated from customer replies.</span>
          </span>
        </div>

        {selectedTicketMessages.length === 0 ? (
          <div className="thread-empty-box">
            <p>No replies or internal notes logged yet for this ticket.</p>
          </div>
        ) : (
          <div className="messages-thread">
            {selectedTicketMessages.map((msg) => {
              const isNote = msg.type === 'note';
              const isAgent = msg.authorRole === 'agent';

              return (
                <article
                  key={msg.id}
                  className={`message-card ${
                    isNote 
                      ? 'message-card-note' 
                      : isAgent 
                        ? 'message-card-agent' 
                        : 'message-card-customer'
                  }`}
                  aria-label={`${isNote ? 'Internal note' : 'Reply'} by ${msg.author}`}
                >
                  <div className="message-card-header">
                    <div className="message-author-info">
                      <div 
                        className={`avatar-circle ${
                          isNote ? 'note-avatar' : isAgent ? 'agent-avatar' : 'customer-avatar'
                        }`}
                      >
                        {isNote ? <Lock size={14} /> : msg.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="author-details">
                        <div className="author-name-line">
                          <span className="author-name">{msg.author}</span>
                          <MessageTypeBadge type={msg.type} />
                        </div>
                        {isNote && (
                          <span className="internal-flag-text">
                            Internal note — demo &bull; Not visible to customer
                          </span>
                        )}
                      </div>
                    </div>

                    <time className="message-timestamp" dateTime={msg.createdAt}>
                      {new Date(msg.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>

                  <div className="message-body">
                    <p>{msg.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Message & Internal Note Composer */}
      <section className="composer-section" aria-label="Add reply or internal note">
        <form onSubmit={handleSubmitMessage} className="composer-form">
          {/* Tab selector for Reply vs Internal Note */}
          <div className="composer-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={messageType === 'reply'}
              className={`composer-tab ${messageType === 'reply' ? 'active-reply-tab' : ''}`}
              onClick={() => {
                setMessageType('reply');
                setAuthorRole('agent');
                if (!authorName) setAuthorName('Alex (Support Agent)');
              }}
            >
              <MessageSquare size={16} aria-hidden="true" />
              <span>Public Customer Reply</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={messageType === 'note'}
              className={`composer-tab ${messageType === 'note' ? 'active-note-tab' : ''}`}
              onClick={() => {
                setMessageType('note');
                setAuthorRole('agent');
                if (!authorName) setAuthorName('Alex (Support Agent)');
              }}
            >
              <Lock size={16} aria-hidden="true" />
              <span>Internal Staff Note</span>
            </button>
          </div>

          <div className={`composer-box ${messageType === 'note' ? 'composer-box-note' : 'composer-box-reply'}`}>
            {/* Context Notice */}
            <div className="composer-banner">
              {messageType === 'note' ? (
                <div className="composer-note-hint">
                  <Lock size={15} aria-hidden="true" />
                  <span>
                    <strong>Internal Staff Note:</strong> This note is saved for internal records only. It will be styled with an amber badge and lock icon.
                  </span>
                </div>
              ) : (
                <div className="composer-reply-hint">
                  <MessageSquare size={15} aria-hidden="true" />
                  <span>
                    <strong>Public Reply:</strong> This response will be logged in the conversation thread. (Local prototype: emails are simulated).
                  </span>
                </div>
              )}
            </div>

            {/* Author details row */}
            <div className="composer-meta-row">
              <div className="form-group flex-1">
                <label htmlFor="composer-author" className="composer-meta-label">
                  Posting As:
                </label>
                <input
                  id="composer-author"
                  type="text"
                  className="form-input composer-input-sm"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Author Name"
                  required
                />
              </div>

              {messageType === 'reply' && (
                <div className="form-group">
                  <label htmlFor="composer-role" className="composer-meta-label">
                    Role:
                  </label>
                  <select
                    id="composer-role"
                    className="form-select composer-input-sm"
                    value={authorRole}
                    onChange={(e) => {
                      const newRole = e.target.value as AuthorRole;
                      setAuthorRole(newRole);
                      if (newRole === 'customer') {
                        setAuthorName(selectedTicket.customerName);
                      } else {
                        setAuthorName('Alex (Support Agent)');
                      }
                    }}
                  >
                    <option value="agent">Support Agent</option>
                    <option value="customer">Customer ({selectedTicket.customerName})</option>
                  </select>
                </div>
              )}
            </div>

            {/* Message Body Input */}
            <div className="composer-textarea-wrap">
              <label htmlFor="composer-body" className="sr-only">
                {messageType === 'note' ? 'Internal Note Content' : 'Reply Message Content'}
              </label>
              <textarea
                id="composer-body"
                className="form-textarea composer-textarea"
                rows={4}
                value={messageBody}
                onChange={(e) => {
                  setMessageBody(e.target.value);
                  if (formError) setFormError(null);
                }}
                onKeyDown={handleKeyDownComposer}
                placeholder={
                  messageType === 'note'
                    ? 'Write notes for your team (e.g., debug findings, ticket triage notes, SLA reminders)...'
                    : `Write a response to ${selectedTicket.customerName}...`
                }
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? 'composer-error' : undefined}
                required
              />
            </div>

            {formError && (
              <div id="composer-error" className="form-error-inline" role="alert">
                <ShieldAlert size={14} aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            {/* Composer Footer Actions */}
            <div className="composer-footer">
              <div className="composer-status-option">
                <label htmlFor="composer-next-status" className="status-option-label">
                  On submit set status to:
                </label>
                <select
                  id="composer-next-status"
                  className="form-select status-option-select"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as Status | 'keep')}
                >
                  <option value="keep">Keep Current ({selectedTicket.status})</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Open">Open</option>
                </select>
              </div>

              <div className="composer-action-btns">
                <span className="keyboard-tip" aria-hidden="true">
                  Ctrl + Enter to send
                </span>
                <button
                  type="submit"
                  className={`btn ${messageType === 'note' ? 'btn-amber' : 'btn-primary'}`}
                  disabled={isSubmitting || !messageBody.trim()}
                >
                  {messageType === 'note' ? (
                    <>
                      <Lock size={16} aria-hidden="true" />
                      <span>Save Internal Note</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      <span>Post Reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};
