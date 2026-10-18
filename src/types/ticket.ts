export type Priority = 'Low' | 'Medium' | 'High';

export type Status = 'Open' | 'In Progress' | 'Resolved';

export type Category = 
  | 'Technical'
  | 'Billing'
  | 'General'
  | 'Feature Request'
  | 'Account';

export type MessageType = 'reply' | 'note';

export type AuthorRole = 'customer' | 'agent';

export interface TicketMessage {
  id: string;
  ticketId: string;
  type: MessageType;
  author: string;
  authorRole: AuthorRole;
  body: string;
  createdAt: string; // ISO string
}

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type SortOption = 'newest' | 'oldest' | 'priority-desc' | 'priority-asc' | 'updated';

export interface TicketFilterState {
  searchQuery: string;
  status: 'All' | Status;
  priority: 'All' | Priority;
  category: 'All' | Category;
  sortBy: SortOption;
}

export interface StorageStatus {
  isAvailable: boolean;
  error?: string;
  warning?: string;
}

export interface CreateTicketInput {
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface CreateMessageInput {
  ticketId: string;
  type: MessageType;
  author: string;
  authorRole: AuthorRole;
  body: string;
}

export type AppView = 'dashboard' | 'tickets';
