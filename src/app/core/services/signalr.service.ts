import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { TicketMessageResponse } from '../models/ticket.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private authService = inject(AuthService);
  private hubConnection?: signalR.HubConnection;
  private messageReceivedSubject = new Subject<TicketMessageResponse>();
  private userTypingSubject = new Subject<{ userId: number; fullname: string }>();
  private startPromise: Promise<void> | null = null;

  messageReceived$: Observable<TicketMessageResponse> = this.messageReceivedSubject.asObservable();
  userTyping$: Observable<{ userId: number; fullname: string }> = this.userTypingSubject.asObservable();

  async start(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;
    if (this.startPromise) return this.startPromise;

    const token = this.authService.getToken();
    if (!token) {
      this.startPromise = null;
      return;
    }

    this.startPromise = this.buildAndStart(token);
    return this.startPromise;
  }

  private async buildAndStart(token: string): Promise<void> {
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.hubUrl}`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      this.hubConnection.on('ReceiveMessage', (message: TicketMessageResponse) => {
        this.messageReceivedSubject.next(message);
      });

      this.hubConnection.on('UserTyping', (data: { userId: number; fullname: string }) => {
        this.userTypingSubject.next(data);
      });

      this.hubConnection.onreconnecting(() => {
        this.startPromise = null;
      });

      this.hubConnection.onclose(() => {
        this.hubConnection = undefined;
        this.startPromise = null;
      });

      await this.hubConnection.start();
    } catch (err) {
      this.hubConnection = undefined;
      this.startPromise = null;
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.startPromise = null;
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = undefined;
    }
  }

  private async ensureConnected(): Promise<boolean> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) return true;
    try {
      await this.start();
      return this.hubConnection?.state === signalR.HubConnectionState.Connected;
    } catch {
      return false;
    }
  }

  async joinTicketGroup(ticketId: number): Promise<void> {
    if (await this.ensureConnected()) {
      await this.hubConnection!.invoke('JoinTicketGroup', ticketId);
    }
  }

  async leaveTicketGroup(ticketId: number): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveTicketGroup', ticketId);
    }
  }

  async startNlpConversation(ticketId: number): Promise<void> {
    if (await this.ensureConnected()) {
      await this.hubConnection!.invoke('StartNlpConversation', ticketId);
    }
  }

  async sendNlpMessage(ticketId: number, content: string): Promise<void> {
    if (await this.ensureConnected()) {
      await this.hubConnection!.invoke('SendNlpMessage', ticketId, content);
    }
  }

  async notifyTyping(ticketId: number): Promise<void> {
    if (await this.ensureConnected()) {
      await this.hubConnection!.invoke('NotifyTyping', ticketId);
    }
  }
}
