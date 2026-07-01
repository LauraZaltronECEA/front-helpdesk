import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketInboxResponse, TicketDetailResponse, TicketCreateDTO, TicketUpdateDTO, TicketCreateResponse, TicketMessageResponse, SendMessageDTO } from '../models/ticket.model';
import { GeneralResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ticket`;

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getInbox(): Observable<TicketInboxResponse[]> {
    return this.http.get<TicketInboxResponse[]>(`${this.apiUrl}/inbox`);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  getDetail(id: number): Observable<TicketDetailResponse> {
    return this.http.get<TicketDetailResponse>(`${this.apiUrl}/${id}/detail`);
  }

  create(dto: TicketCreateDTO): Observable<TicketCreateResponse> {
    return this.http.post<TicketCreateResponse>(this.apiUrl, dto);
  }

  update(id: number, dto: TicketUpdateDTO): Observable<GeneralResponse> {
    return this.http.put<GeneralResponse>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<GeneralResponse> {
    return this.http.delete<GeneralResponse>(`${this.apiUrl}/${id}`);
  }

  hardDelete(id: number): Observable<GeneralResponse> {
    return this.http.delete<GeneralResponse>(`${this.apiUrl}/${id}/hard`);
  }

  getMessages(ticketId: number): Observable<TicketMessageResponse[]> {
    return this.http.get<TicketMessageResponse[]>(`${this.apiUrl}/${ticketId}/messages`);
  }

  sendMessage(ticketId: number, dto: SendMessageDTO): Observable<GeneralResponse> {
    return this.http.post<GeneralResponse>(`${this.apiUrl}/${ticketId}/messages`, dto);
  }

  uploadImage(ticketId: number, file: File): Observable<{ estado: boolean; imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ estado: boolean; imageUrl: string }>(
      `${this.apiUrl}/${ticketId}/images`, formData
    );
  }
}
