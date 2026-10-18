import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTickets } from '../context/useTickets';
import type { Category, Priority } from '../types/ticket';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

export const CreateTicketModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, createTicket } = useTickets();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Technical');
  const [priority, setPriority] = useState<Priority>('Medium');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFocusRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setCustomerName('');
    setCustomerEmail('');
    setSubject('');
    setDescription('');
    setCategory('Technical');
    setPriority('Medium');
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    closeCreateModal();
  }, [resetForm, closeCreateModal]);

  // Focus management when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      const timer = window.setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [isCreateModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreateModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, handleClose]);

  if (!isCreateModalOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errs.customerName = 'Customer name is required.';
    }

    if (!customerEmail.trim()) {
      errs.customerEmail = 'Customer email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errs.customerEmail = 'Please provide a valid email address.';
    }

    if (!subject.trim()) {
      errs.subject = 'Subject is required.';
    } else if (subject.trim().length < 4) {
      errs.subject = 'Subject must be at least 4 characters long.';
    }

    if (!description.trim()) {
      errs.description = 'Problem description is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = createTicket({
      customerName,
      customerEmail,
      subject,
      description,
      category,
      priority,
    });

    setIsSubmitting(false);
    if (result.success) {
      resetForm();
    } else if (result.error) {
      setErrors((prev) => ({ ...prev, form: result.error || 'Failed to create ticket.' }));
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      role="presentation"
    >
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-ticket-title"
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <h2 id="create-ticket-title" className="modal-title">Create New Support Ticket</h2>
            <p className="modal-subtitle">Log a new customer request into your support queue.</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {errors.form && (
            <div className="form-error-banner" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Customer info row */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="ticket-customer-name" className="form-label">
                Customer Name <span className="required-star">*</span>
              </label>
              <input
                ref={initialFocusRef}
                id="ticket-customer-name"
                type="text"
                className={`form-input ${errors.customerName ? 'input-error' : ''}`}
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                }}
                placeholder="e.g. Jane Doe"
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={errors.customerName ? 'name-error' : undefined}
                required
              />
              {errors.customerName && (
                <span id="name-error" className="field-error-msg" role="alert">
                  {errors.customerName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ticket-customer-email" className="form-label">
                Customer Email <span className="required-star">*</span>
              </label>
              <input
                id="ticket-customer-email"
                type="email"
                className={`form-input ${errors.customerEmail ? 'input-error' : ''}`}
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (errors.customerEmail) setErrors((prev) => ({ ...prev, customerEmail: '' }));
                }}
                placeholder="e.g. jane@company.com"
                aria-invalid={Boolean(errors.customerEmail)}
                aria-describedby={errors.customerEmail ? 'email-error' : undefined}
                required
              />
              {errors.customerEmail && (
                <span id="email-error" className="field-error-msg" role="alert">
                  {errors.customerEmail}
                </span>
              )}
            </div>
          </div>

          {/* Category & Priority Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="ticket-category" className="form-label">
                Category
              </label>
              <select
                id="ticket-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="General">General</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Account">Account</option>
              </select>
            </div>

            <div className="form-group">
              <span className="form-label">Priority Level</span>
              <div className="priority-radio-group" role="radiogroup" aria-label="Priority level">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                  <label 
                    key={p} 
                    className={`priority-radio-option priority-radio-${p.toLowerCase()} ${priority === p ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                      className="sr-only"
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label htmlFor="ticket-subject" className="form-label">
              Subject Line <span className="required-star">*</span>
            </label>
            <input
              id="ticket-subject"
              type="text"
              className={`form-input ${errors.subject ? 'input-error' : ''}`}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
              }}
              placeholder="Brief summary of the issue (e.g. Password reset link not arriving)"
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              required
            />
            {errors.subject && (
              <span id="subject-error" className="field-error-msg" role="alert">
                {errors.subject}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="ticket-description" className="form-label">
              Problem Description <span className="required-star">*</span>
            </label>
            <textarea
              id="ticket-description"
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Detailed description of the issue, error messages, steps to reproduce, or requested changes..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'desc-error' : undefined}
              required
            />
            {errors.description && (
              <span id="desc-error" className="field-error-msg" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="submit-create-ticket-btn"
            >
              <PlusCircle size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'Creating...' : 'Create Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
