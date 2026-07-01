import { TicketInboxResponse } from './ticket.model';

export interface DashboardResponse {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  lowPriority: number;
  mediumPriority: number;
  highPriority: number;
  ticketsCreatedByMe: number;
  ticketsAssignedToMe: number;
  recentTickets: TicketInboxResponse[];
}
