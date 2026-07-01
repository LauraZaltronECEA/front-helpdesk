export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdById: number;
  assignedToId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  isDeleted: number;
  solution?: string | null;
  area?: number | null;
  createdBy?: { id: number; username: string; fullname: string; email: string };
  assignedTo?: { id: number; username: string; fullname: string; email: string } | null;
}

export interface TicketInboxResponse {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdById: number;
  createdByUsername: string;
  createdByFullname: string;
  assignedToId?: number | null;
  assignedToUsername?: string | null;
  assignedToFullname?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TicketDetailResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdById: number;
  createdByUsername: string;
  createdByFullname: string;
  createdByEmail: string;
  assignedToId?: number | null;
  assignedToUsername?: string | null;
  assignedToFullname?: string | null;
  assignedToEmail?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  area?: number | null;
  areaName?: string | null;
  solution?: string | null;
}

export interface TicketCreateDTO {
  title: string;
  description: string;
  priority: string;
}

export interface TicketUpdateDTO {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: number | null;
  area?: number | null;
  solution?: string | null;
}

export interface TicketCreateResponse {
  estado: boolean;
  codigo: number;
  mensaje: string;
  ticketId: number;
}

export interface TicketMessageResponse {
  id: number;
  userId: number;
  userFullname: string;
  userUsername: string;
  content: string;
  createdAt: string;
}

export interface SendMessageDTO {
  content: string;
}
