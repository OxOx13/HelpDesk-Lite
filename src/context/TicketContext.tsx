import React, { useState, useMemo, useCallback } from 'react';
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
import {
  loadTicketsFromStorage,
  loadMessagesFromStorage,
  saveTicketsToStorage,
  saveMessagesToStorage,
  mergeDemoData,
  clearStorage,
  isLocalStorageAvailable,
  StorageError,
} from '../services/storage';
import { TicketContext } from './TicketContextDefinition';
import type { TicketContextType } from './TicketContextDefinition';

const defaultFilters: TicketFilterState = {
  searchQuery: '',
  status: 'All',
  priority: 'All',
  category: 'All',
  sortBy: 'newest',
};

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous lazy state initialization from storage (avoids cascading effect renders)
  const [initialData] = useState(() => {
    const isAvailable = isLocalStorageAvailable();
    if (!isAvailable) {
      return {
        tickets: [] as Ticket[],
        messages: [] as TicketMessage[],
        storageStatus: {
          isAvailable: false,
          warning: 'localStorage is unavailable in your browser environment. Any changes will only stay in memory.',
        } as StorageStatus,
      };
    }

    const { tickets: storedTickets, warning: ticketWarning } = loadTicketsFromStorage();
    const { messages: storedMessages, warning: msgWarning } = loadMessagesFromStorage();

    return {
      tickets: storedTickets,
      messages: storedMessages,
      storageStatus: {
        isAvailable: true,
        warning: ticketWarning || msgWarning,
      } as StorageStatus,
    };
  });

  const [tickets, setTickets] = useState<Ticket[]>(initialData.tickets);
  const [messages, setMessages] = useState<TicketMessage[]>(initialData.messages);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [filterState, setFilterState] = useState<TicketFilterState>(defaultFilters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(initialData.storageStatus);

  // Toast notification helper with auto-hide
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissStorageNotice = useCallback(() => {
    setStorageStatus((prev) => ({ ...prev, error: undefined, warning: undefined }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState(defaultFilters);
  }, []);

  // Generate next sequential Ticket ID
  const generateTicketId = useCallback(() => {
    const numbers = tickets
      .map((t) => {
        const match = t.id.match(/^HD-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `HD-${maxNum + 1}`;
  }, [tickets]);

  // Create ticket
  const createTicket = useCallback(
    (input: CreateTicketInput) => {
      const now = new Date().toISOString();
      const newTicket: Ticket = {
        id: generateTicketId(),
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim(),
        subject: input.subject.trim(),
        description: input.description.trim(),
        category: input.category,
        priority: input.priority,
        status: 'Open',
        createdAt: now,
        updatedAt: now,
      };

      const updatedTickets = [newTicket, ...tickets];

      try {
        saveTicketsToStorage(updatedTickets);
        setTickets(updatedTickets);
        setIsCreateModalOpen(false);
        setSelectedTicketId(newTicket.id);
        setActiveView('tickets');
        showToast(`Ticket ${newTicket.id} created successfully.`);
        return { success: true, ticket: newTicket };
      } catch (err) {
        const msg = err instanceof StorageError ? err.message : 'Failed to save ticket to storage.';
        setStorageStatus((prev) => ({ ...prev, error: msg }));
        // Still update in-memory state so user is not blocked
        setTickets(updatedTickets);
        setIsCreateModalOpen(false);
        setSelectedTicketId(newTicket.id);
        return { success: true, ticket: newTicket, error: msg };
      }
    },
    [tickets, generateTicketId, showToast]
  );

  // Update ticket status
  const updateTicketStatus = useCallback(
    (ticketId: string, newStatus: Status) => {
      const now = new Date().toISOString();
      const updatedTickets = tickets.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: now } : t
      );

      try {
        saveTicketsToStorage(updatedTickets);
        setTickets(updatedTickets);
        showToast(`Ticket ${ticketId} status changed to ${newStatus}.`);
      } catch (err) {
        const msg = err instanceof StorageError ? err.message : 'Failed to update ticket status in storage.';
        setStorageStatus((prev) => ({ ...prev, error: msg }));
        setTickets(updatedTickets);
      }
    },
    [tickets, showToast]
  );

  // Add a reply or internal note
  const addMessage = useCallback(
    (input: CreateMessageInput) => {
      const now = new Date().toISOString();
      const newMessage: TicketMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ticketId: input.ticketId,
        type: input.type,
        author: input.author.trim() || (input.authorRole === 'agent' ? 'Support Agent' : 'Customer'),
        authorRole: input.authorRole,
        body: input.body.trim(),
        createdAt: now,
      };

      const updatedMessages = [...messages, newMessage];
      const updatedTickets = tickets.map((t) =>
        t.id === input.ticketId ? { ...t, updatedAt: now } : t
      );

      try {
        saveMessagesToStorage(updatedMessages);
        saveTicketsToStorage(updatedTickets);
        setMessages(updatedMessages);
        setTickets(updatedTickets);
        showToast(input.type === 'note' ? 'Internal note added.' : 'Reply posted.');
        return { success: true };
      } catch (err) {
        const msg = err instanceof StorageError ? err.message : 'Failed to save message to storage.';
        setStorageStatus((prev) => ({ ...prev, error: msg }));
        setMessages(updatedMessages);
        setTickets(updatedTickets);
        return { success: false, error: msg };
      }
    },
    [messages, tickets, showToast]
  );

  // Non-destructive fictional demo data loader
  const loadDemoData = useCallback(() => {
    const { newTickets, newMessages, addedTicketsCount, addedMessagesCount } = mergeDemoData(
      tickets,
      messages
    );

    if (addedTicketsCount === 0) {
      showToast('All sample demo tickets are already present in your list.');
      return { addedTickets: 0, addedMessages: 0 };
    }

    try {
      saveTicketsToStorage(newTickets);
      saveMessagesToStorage(newMessages);
      setTickets(newTickets);
      setMessages(newMessages);
      showToast(`Added ${addedTicketsCount} sample demo ticket(s) without altering your existing data.`);
      return { addedTickets: addedTicketsCount, addedMessages: addedMessagesCount };
    } catch (err) {
      const msg = err instanceof StorageError ? err.message : 'Failed to save demo tickets to storage.';
      setStorageStatus((prev) => ({ ...prev, error: msg }));
      setTickets(newTickets);
      setMessages(newMessages);
      return { addedTickets: addedTicketsCount, addedMessages: addedMessagesCount };
    }
  }, [tickets, messages, showToast]);

  // Clear all data
  const clearAllTickets = useCallback(() => {
    clearStorage();
    setTickets([]);
    setMessages([]);
    setSelectedTicketId(null);
    showToast('All tickets and messages have been cleared from local storage.');
  }, [showToast]);

  // Selected ticket object
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  // Messages for selected ticket
  const selectedTicketMessages = useMemo(() => {
    if (!selectedTicketId) return [];
    return messages
      .filter((m) => m.ticketId === selectedTicketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedTicketId]);

  // Dashboard Metrics
  const metrics = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let high = 0;
    let med = 0;
    let low = 0;

    for (const t of tickets) {
      if (t.status === 'Open') open++;
      else if (t.status === 'In Progress') inProgress++;
      else if (t.status === 'Resolved') resolved++;

      if (t.priority === 'High') high++;
      else if (t.priority === 'Medium') med++;
      else if (t.priority === 'Low') low++;
    }

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
      highPriority: high,
      mediumPriority: med,
      lowPriority: low,
    };
  }, [tickets]);

  // Filtered and Sorted Tickets
  const filteredTickets = useMemo(() => {
    const q = filterState.searchQuery.trim().toLowerCase();

    return tickets
      .filter((t) => {
        // Search query
        if (q) {
          const inId = t.id.toLowerCase().includes(q);
          const inCustomer = t.customerName.toLowerCase().includes(q);
          const inEmail = t.customerEmail.toLowerCase().includes(q);
          const inSubject = t.subject.toLowerCase().includes(q);
          const inDesc = t.description.toLowerCase().includes(q);
          if (!inId && !inCustomer && !inEmail && !inSubject && !inDesc) {
            return false;
          }
        }

        // Status
        if (filterState.status !== 'All' && t.status !== filterState.status) {
          return false;
        }

        // Priority
        if (filterState.priority !== 'All' && t.priority !== filterState.priority) {
          return false;
        }

        // Category
        if (filterState.category !== 'All' && t.category !== filterState.category) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filterState.sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'updated':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          case 'priority-desc': {
            const weight = { High: 3, Medium: 2, Low: 1 };
            return weight[b.priority] - weight[a.priority];
          }
          case 'priority-asc': {
            const weight = { High: 3, Medium: 2, Low: 1 };
            return weight[a.priority] - weight[b.priority];
          }
          default:
            return 0;
        }
      });
  }, [tickets, filterState]);

  const value: TicketContextType = {
    tickets,
    messages,
    selectedTicket,
    selectedTicketId,
    activeView,
    filterState,
    storageStatus,
    isCreateModalOpen,
    toastMessage,
    metrics,
    filteredTickets,
    selectedTicketMessages,
    setActiveView,
    setSelectedTicketId,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    setFilterState,
    resetFilters,
    createTicket,
    updateTicketStatus,
    addMessage,
    loadDemoData,
    clearAllTickets,
    dismissStorageNotice,
    showToast,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};
