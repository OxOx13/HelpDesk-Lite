import { createContext } from 'react';
import type {
  Ticket,
  TicketMessage,
  Status,
  TicketFilterState,
  StorageStatus,
  CreateTicketInput,
  CreateMessageInput,
  AppView,
} from '../types/ticket';

export interface TicketContextType {
  tickets: Ticket[];
  messages: TicketMessage[];
  selectedTicket: Ticket | null;
  selectedTicketId: string | null;
  activeView: AppView;
  filterState: TicketFilterState;
  storageStatus: StorageStatus;
  isCreateModalOpen: boolean;
  toastMessage: string | null;
  
  // Metrics
  metrics: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
  filteredTickets: Ticket[];
  selectedTicketMessages: TicketMessage[];

  // Actions
  setActiveView: (view: AppView) => void;
  setSelectedTicketId: (id: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  setFilterState: React.Dispatch<React.SetStateAction<TicketFilterState>>;
  resetFilters: () => void;
  createTicket: (input: CreateTicketInput) => { success: boolean; ticket?: Ticket; error?: string };
  updateTicketStatus: (ticketId: string, newStatus: Status) => void;
  addMessage: (input: CreateMessageInput) => { success: boolean; error?: string };
  loadDemoData: () => { addedTickets: number; addedMessages: number };
  clearAllTickets: () => void;
  dismissStorageNotice: () => void;
  showToast: (msg: string) => void;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);
