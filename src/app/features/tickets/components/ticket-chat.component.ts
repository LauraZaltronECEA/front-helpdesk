import { Component, input, signal, inject, OnInit, OnDestroy, ElementRef, viewChild, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../../core/services/ticket.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { TicketMessageResponse } from '../../../core/models/ticket.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ticket-chat',
  standalone: true,
  imports: [FormsModule, DatePipe, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="chat-card">
      <mat-card-content class="chat-messages" #chatMessages>
        @if (messagesLoading()) {
          <div class="loading-msgs"><mat-spinner diameter="24"></mat-spinner></div>
        } @else {
          @for (msg of messages(); track msg.id) {
            <div class="message" [class.own]="msg.userId === currentUserId()">
              <div class="msg-header">
                <strong>{{ msg.userFullname || msg.userUsername }}</strong>
                <span class="msg-time">{{ msg.createdAt | date:'short' }}</span>
              </div>
              <div class="msg-content">{{ msg.content }}</div>
            </div>
          } @empty {
            <div class="empty-chat">Sin mensajes aún. Escribe el primero.</div>
          }
          @if (typingUser()) {
            <div class="typing-indicator">{{ typingUser() }} está escribiendo...</div>
          }
        }
      </mat-card-content>
      <mat-card-actions class="chat-input">
        <mat-form-field appearance="outline" class="input-field">
          <input matInput [(ngModel)]="newMessage" placeholder="Escribe un mensaje..."
                 (keyup.enter)="sendMessage()" [disabled]="sending()"
                 (input)="onTyping()">
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="sendMessage()"
                [disabled]="sending() || !newMessage.trim()">
          @if (sending()) { <mat-spinner diameter="20"></mat-spinner> }
          @else { <mat-icon>send</mat-icon> }
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .chat-card { height: 450px; display: flex; flex-direction: column; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .loading-msgs { display: flex; justify-content: center; padding: 24px; }
    .empty-chat { text-align: center; color: #999; padding: 40px; }
    .message { max-width: 75%; padding: 10px 14px; border-radius: 12px; background: #f0f0f0; align-self: flex-start; }
    .message.own { align-self: flex-end; background: #e3f2fd; }
    .msg-header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 4px; font-size: 12px; }
    .msg-time { color: #999; }
    .msg-content { word-break: break-word; white-space: pre-wrap; }
    .typing-indicator { font-size: 12px; color: #999; font-style: italic; padding: 4px 16px; }
    .chat-input { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-top: 1px solid #e0e0e0; }
    .input-field { flex: 1; margin-bottom: 0; }
  `]
})
export class TicketChatComponent implements OnInit, OnDestroy {
  private ticketService = inject(TicketService);
  private signalRService = inject(SignalRService);
  private authService = inject(AuthService);

  ticketId = input.required<number>();
  private chatMessages = viewChild<ElementRef>('chatMessages');

  messages = signal<TicketMessageResponse[]>([]);
  newMessage = '';
  messagesLoading = signal(true);
  sending = signal(false);
  typingUser = signal<string | null>(null);
  currentUserId = signal(0);
  private typingTimeout: any;

  constructor() {
    effect(() => {
      if (this.messages().length) {
        setTimeout(() => {
          const el = this.chatMessages()?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
    });
  }

  ngOnInit() {
    const user = this.authService.getUser();
    this.currentUserId.set(user?.userId || 0);

    this.signalRService.messageReceived$.subscribe(msg => {
      this.messages.update(msgs => [...msgs, msg]);
    });

    this.signalRService.userTyping$.subscribe(data => {
      if (data.userId !== this.currentUserId()) {
        this.typingUser.set(data.fullname);
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.typingUser.set(null), 2000);
      }
    });

    this.loadMessages();
    this.signalRService.joinTicketGroup(this.ticketId());
  }

  ngOnDestroy() {
    this.signalRService.leaveTicketGroup(this.ticketId());
    clearTimeout(this.typingTimeout);
  }

  loadMessages() {
    this.ticketService.getMessages(this.ticketId()).subscribe({
      next: (res) => { this.messages.set(res); this.messagesLoading.set(false); },
      error: () => this.messagesLoading.set(false)
    });
  }

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content) return;

    this.sending.set(true);
    const user = this.authService.getUser();
    if (user?.role === 'viewer') {
      this.signalRService.sendNlpMessage(this.ticketId(), content)
        .then(() => { this.newMessage = ''; this.sending.set(false); })
        .catch(() => this.sending.set(false));
    } else {
      this.ticketService.sendMessage(this.ticketId(), { content }).subscribe({
        next: () => { this.newMessage = ''; this.sending.set(false); },
        error: () => this.sending.set(false)
      });
    }
  }

  onTyping() {
    this.signalRService.notifyTyping(this.ticketId());
  }
}
