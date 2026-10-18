import React from 'react';
import type { Priority, Status, Category, MessageType } from '../types/ticket';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Minus, 
  ArrowDown, 
  Lock, 
  MessageSquare 
} from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config = {
    High: {
      label: 'High',
      className: 'badge-priority-high',
      icon: <ShieldAlert className="badge-icon" size={size === 'sm' ? 12 : 14} aria-hidden="true" />,
    },
    Medium: {
      label: 'Medium',
      className: 'badge-priority-med',
      icon: <Minus className="badge-icon" size={size === 'sm' ? 12 : 14} aria-hidden="true" />,
    },
    Low: {
      label: 'Low',
      className: 'badge-priority-low',
      icon: <ArrowDown className="badge-icon" size={size === 'sm' ? 12 : 14} aria-hidden="true" />,
    },
  }[priority];

  return (
    <span className={`badge ${config.className} badge-${size}`} aria-label={`Priority: ${priority}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    Open: {
      label: 'Open',
      className: 'badge-status-open',
      icon: <AlertCircle className="badge-icon" size={size === 'sm' ? 12 : 14} aria-hidden="true" />,
    },
    'In Progress': {
      label: 'In Progress',
      className: 'badge-status-progress',
      icon: <Clock className="badge-icon" size={size === 'sm' ? 12 : 14} aria-hidden="true" />,
    },
    Resolved: {
      label: 'Resolved',
      className: 'badge-status-resolved',
      icon: <CheckCircle2 className="badge-icon" size={size === 'sm' ? 12 : 14} aria-hidden="true" />,
    },
  }[status];

  return (
    <span className={`badge ${config.className} badge-${size}`} aria-label={`Status: ${status}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

interface CategoryBadgeProps {
  category: Category;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return (
    <span className="badge badge-category" aria-label={`Category: ${category}`}>
      {category}
    </span>
  );
};

interface MessageTypeBadgeProps {
  type: MessageType;
}

export const MessageTypeBadge: React.FC<MessageTypeBadgeProps> = ({ type }) => {
  if (type === 'note') {
    return (
      <span className="badge badge-note" aria-label="Internal staff note">
        <Lock size={12} aria-hidden="true" />
        <span>Internal Note</span>
      </span>
    );
  }

  return (
    <span className="badge badge-reply" aria-label="Customer reply">
      <MessageSquare size={12} aria-hidden="true" />
      <span>Public Reply</span>
    </span>
  );
};
