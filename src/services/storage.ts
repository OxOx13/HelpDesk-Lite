import type { Ticket, TicketMessage, Priority, Status, Category, MessageType, AuthorRole } from '../types/ticket';
import { DEMO_TICKETS, DEMO_MESSAGES } from '../data/demoData';

const TICKETS_KEY = 'helpdesk_lite_tickets_v1';
const MESSAGES_KEY = 'helpdesk_lite_messages_v1';

export class StorageError extends Error {
  readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
  }
}

const VALID_PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
const VALID_STATUSES: Status[] = ['Open', 'In Progress', 'Resolved'];
const VALID_CATEGORIES: Category[] = ['Technical', 'Billing', 'General', 'Feature Request', 'Account'];
const VALID_MSG_TYPES: MessageType[] = ['reply', 'note'];
const VALID_AUTHOR_ROLES: AuthorRole[] = ['customer', 'agent'];

export function isValidTicket(item: unknown): item is Ticket {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' && candidate.id.trim().length > 0 &&
    typeof candidate.customerName === 'string' && candidate.customerName.trim().length > 0 &&
    typeof candidate.customerEmail === 'string' && candidate.customerEmail.includes('@') &&
    typeof candidate.subject === 'string' && candidate.subject.trim().length > 0 &&
    typeof candidate.description === 'string' &&
    VALID_CATEGORIES.includes(candidate.category as Category) &&
    VALID_PRIORITIES.includes(candidate.priority as Priority) &&
    VALID_STATUSES.includes(candidate.status as Status) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

export function isValidMessage(item: unknown): item is TicketMessage {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' && candidate.id.trim().length > 0 &&
    typeof candidate.ticketId === 'string' && candidate.ticketId.trim().length > 0 &&
    VALID_MSG_TYPES.includes(candidate.type as MessageType) &&
    typeof candidate.author === 'string' && candidate.author.trim().length > 0 &&
    VALID_AUTHOR_ROLES.includes(candidate.authorRole as AuthorRole) &&
    typeof candidate.body === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}

/**
 * Checks if localStorage is functional in this environment.
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__hd_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load tickets from localStorage, validating schema and sanitizing corrupted records.
 */
export function loadTicketsFromStorage(): { tickets: Ticket[]; warning?: string } {
  if (!isLocalStorageAvailable()) {
    return {
      tickets: [],
      warning: 'Local storage is unavailable or restricted. Changes will only persist in memory for this session.',
    };
  }

  try {
    const rawData = window.localStorage.getItem(TICKETS_KEY);
    if (!rawData) {
      return { tickets: [] };
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn('Storage format error: tickets is not an array. Resetting corrupted key.');
      return {
        tickets: [],
        warning: 'Corrupted ticket data detected in local storage. Starting with empty ticket list.',
      };
    }

    const validTickets: Ticket[] = [];
    let discardedCount = 0;

    for (const item of parsed) {
      if (isValidTicket(item)) {
        validTickets.push(item);
      } else {
        discardedCount++;
      }
    }

    if (discardedCount > 0) {
      return {
        tickets: validTickets,
        warning: `Notice: ${discardedCount} invalid or malformed ticket(s) were excluded from storage.`,
      };
    }

    return { tickets: validTickets };
  } catch (err) {
    console.error('Failed to parse tickets from storage', err);
    return {
      tickets: [],
      warning: 'Encountered JSON parse error while reading tickets from storage. Fresh state loaded.',
    };
  }
}

/**
 * Load conversation messages from localStorage.
 */
export function loadMessagesFromStorage(): { messages: TicketMessage[]; warning?: string } {
  if (!isLocalStorageAvailable()) {
    return { messages: [] };
  }

  try {
    const rawData = window.localStorage.getItem(MESSAGES_KEY);
    if (!rawData) {
      return { messages: [] };
    }

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return {
        messages: [],
        warning: 'Corrupted messages data detected in local storage.',
      };
    }

    const validMessages: TicketMessage[] = [];
    for (const item of parsed) {
      if (isValidMessage(item)) {
        validMessages.push(item);
      }
    }

    return { messages: validMessages };
  } catch (err) {
    console.error('Failed to parse messages from storage', err);
    return {
      messages: [],
      warning: 'Could not read messages from storage due to invalid JSON data.',
    };
  }
}

/**
 * Save tickets to localStorage with error catching (e.g. QuotaExceededError).
 */
export function saveTicketsToStorage(tickets: Ticket[]): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('Browser localStorage is not available. Changes cannot be permanently saved.');
  }

  try {
    window.localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      throw new StorageError('Storage quota exceeded. Please export or delete older tickets.', err);
    }
    throw new StorageError('Failed to save tickets to local storage.', err);
  }
}

/**
 * Save conversation messages to localStorage.
 */
export function saveMessagesToStorage(messages: TicketMessage[]): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('Browser localStorage is not available. Messages cannot be permanently saved.');
  }

  try {
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      throw new StorageError('Storage quota exceeded while saving messages.', err);
    }
    throw new StorageError('Failed to save messages to local storage.', err);
  }
}

/**
 * Non-destructive demo data loader:
 * Merges demo tickets without overwriting existing tickets with the same ID or deleting user-created tickets.
 */
export function mergeDemoData(
  existingTickets: Ticket[],
  existingMessages: TicketMessage[]
): {
  newTickets: Ticket[];
  newMessages: TicketMessage[];
  addedTicketsCount: number;
  addedMessagesCount: number;
} {
  const existingTicketIds = new Set(existingTickets.map((t) => t.id));
  const existingMessageIds = new Set(existingMessages.map((m) => m.id));

  const ticketsToAdd = DEMO_TICKETS.filter((demoT) => !existingTicketIds.has(demoT.id));
  const messagesToAdd = DEMO_MESSAGES.filter((demoM) => !existingMessageIds.has(demoM.id));

  const mergedTickets = [...existingTickets, ...ticketsToAdd];
  const mergedMessages = [...existingMessages, ...messagesToAdd];

  return {
    newTickets: mergedTickets,
    newMessages: mergedMessages,
    addedTicketsCount: ticketsToAdd.length,
    addedMessagesCount: messagesToAdd.length,
  };
}

/**
 * Clear all tickets and messages from localStorage.
 */
export function clearStorage(): void {
  if (isLocalStorageAvailable()) {
    window.localStorage.removeItem(TICKETS_KEY);
    window.localStorage.removeItem(MESSAGES_KEY);
  }
}
