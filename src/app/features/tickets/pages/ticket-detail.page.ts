import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketDetailResponse, TicketUpdateDTO } from '../../../core/models/ticket.model';
import { TicketChatComponent } from '../components/ticket-chat.component';
import { AuthService } from '../../../core/services/auth.service';
import { SignalRService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [DatePipe, FormsModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatTabsModule, TicketChatComponent],
  template: `
    @if (loading()) {
      <div class="loading-container"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="detail-container">
        <button mat-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon> Volver
        </button>

        <mat-card class="detail-card">
          <mat-card-header>
            <mat-card-title>
              {{ ticket()?.title }}
              <mat-chip [class]="'status-' + ticket()?.status" class="status-chip">
                {{ statusLabel(ticket()?.status || '') }}
              </mat-chip>
              <mat-chip [class]="'priority-' + ticket()?.priority" class="priority-chip">
                {{ ticket()?.priority }}
              </mat-chip>
            </mat-card-title>
            <mat-card-subtitle>
              #{{ ticket()?.id }} · Creado por {{ ticket()?.createdByFullname }} el {{ ticket()?.createdAt | date:'short' }}
              @if (ticket()?.updatedAt) { · Actualizado {{ ticket()?.updatedAt | date:'short' }} }
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <mat-tab-group>
              <mat-tab label="Información">
                <div class="info-tab">
                  <div class="info-grid">
                    <div><strong>Descripción:</strong><p>{{ ticket()?.description }}</p></div>
                    <div class="info-fields">
                      <div><strong>Asignado a:</strong> {{ ticket()?.assignedToFullname || ticket()?.assignedToUsername || 'Sin asignar' }}</div>
                      <div><strong>Área:</strong> {{ ticket()?.areaName || 'Sin área' }}</div>
                      @if (ticket()?.solution) {
                        <div><strong>Solución:</strong><p>{{ ticket()?.solution }}</p></div>
                      }
                    </div>
                  </div>

                  @if (canEdit()) {
                    <div class="edit-section">
                      <h3>Editar ticket</h3>
                      <div class="edit-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>Estado</mat-label>
                          <mat-select [(ngModel)]="editStatus">
                            <mat-option value="open">Abierto</mat-option>
                            <mat-option value="in_progress">En progreso</mat-option>
                            <mat-option value="resolved">Resuelto</mat-option>
                            <mat-option value="closed">Cerrado</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Prioridad</mat-label>
                          <mat-select [(ngModel)]="editPriority">
                            <mat-option value="low">Baja</mat-option>
                            <mat-option value="medium">Media</mat-option>
                            <mat-option value="high">Alta</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Solución</mat-label>
                          <textarea matInput [(ngModel)]="editSolution" rows="3"></textarea>
                        </mat-form-field>
                      </div>
                      <button mat-raised-button color="primary" (click)="updateTicket()"
                              [disabled]="saving()">
                        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
                        @else { Guardar cambios }
                      </button>
                    </div>
                  }
                </div>
              </mat-tab>

              <mat-tab label="Mensajes">
                <app-ticket-chat [ticketId]="ticket()!.id"></app-ticket-chat>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; padding: 80px; }
    .detail-container { max-width: 900px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; }
    .detail-card mat-card-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .status-chip, .priority-chip { font-size: 12px; }
    .info-tab { padding: 16px 0; }
    .info-grid { display: flex; flex-direction: column; gap: 16px; }
    .info-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .edit-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0e0e0; }
    .edit-section h3 { margin-bottom: 16px; }
    .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .status-open { background: #fff3e0 !important; }
    .status-in_progress { background: #e8f5e9 !important; }
    .status-resolved { background: #e0f2f1 !important; }
    .status-closed { background: #f3e5f5 !important; }
    .priority-low { background: #f1f8e9 !important; }
    .priority-medium { background: #fff8e1 !important; }
    .priority-high { background: #fbe9e7 !important; }
  `]
})
export class TicketDetailPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);

  ticket = signal<TicketDetailResponse | null>(null);
  loading = signal(true);
  saving = signal(false);
  editStatus = '';
  editPriority = '';
  editSolution = '';

  private ticketId = 0;

  ngOnInit() {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getDetail(this.ticketId).subscribe({
      next: (res) => {
        this.ticket.set(res);
        this.editStatus = res.status;
        this.editPriority = res.priority;
        this.editSolution = res.solution || '';
        this.loading.set(false);
        this.signalRService.joinTicketGroup(this.ticketId);
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy() {
    if (this.ticketId) {
      this.signalRService.leaveTicketGroup(this.ticketId);
    }
  }

  goBack() { this.location.back(); }

  canEdit(): boolean {
    const user = this.authService.getUser();
    return user?.role === 'admin' || user?.role === 'agent';
  }

  updateTicket() {
    this.saving.set(true);
    const dto: TicketUpdateDTO = {
      status: this.editStatus || undefined,
      priority: this.editPriority || undefined,
      solution: this.editSolution || undefined
    };
    this.ticketService.update(this.ticket()!.id, dto).subscribe({
      next: (res) => {
        if (res.estado) {
          this.snackBar.open('Ticket actualizado', 'Cerrar', { duration: 3000 });
          this.ticket.update(t => t ? { ...t, status: this.editStatus, priority: this.editPriority, solution: this.editSolution } : t);
        } else {
          this.snackBar.open(res.mensaje || 'Error', 'Cerrar', { duration: 3000 });
        }
        this.saving.set(false);
      },
      error: () => { this.saving.set(false); this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 }); }
    });
  }

  statusLabel(s: string) { const m: Record<string, string> = { open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado' }; return m[s] || s; }
}
