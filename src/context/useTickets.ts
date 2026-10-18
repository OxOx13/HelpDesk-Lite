import { useContext } from 'react';
import { TicketContext } from './TicketContextDefinition';
import type { TicketContextType } from './TicketContextDefinition';

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
