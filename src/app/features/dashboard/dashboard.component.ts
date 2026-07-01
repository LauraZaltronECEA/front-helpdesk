import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { TicketInboxResponse } from '../../core/models/ticket.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatTableModule, MatChipsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    } @else {
      <div class="dashboard">
        <h1>Dashboard</h1>
        <div class="stats-grid">
          <mat-card class="stat-card total">
            <mat-card-content>
              <mat-icon>confirmation_number</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.totalTickets }}</span>
                <span class="stat-label">Total</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card open">
            <mat-card-content>
              <mat-icon>new_releases</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.openTickets }}</span>
                <span class="stat-label">Abiertos</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card progress">
            <mat-card-content>
              <mat-icon>pending</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.inProgressTickets }}</span>
                <span class="stat-label">En progreso</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card resolved">
            <mat-card-content>
              <mat-icon>check_circle</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.resolvedTickets }}</span>
                <span class="stat-label">Resueltos</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card closed">
            <mat-card-content>
              <mat-icon>lock</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.closedTickets }}</span>
                <span class="stat-label">Cerrados</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card low">
            <mat-card-content>
              <mat-icon>arrow_downward</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.lowPriority }}</span>
                <span class="stat-label">Baja</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card medium">
            <mat-card-content>
              <mat-icon>remove</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.mediumPriority }}</span>
                <span class="stat-label">Media</span>
              </div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card high">
            <mat-card-content>
              <mat-icon>arrow_upward</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ data()?.highPriority }}</span>
                <span class="stat-label">Alta</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Tickets recientes</mat-card-title>
            <a mat-raised-button color="primary" routerLink="/tickets/new" class="new-btn">
              <mat-icon>add</mat-icon> Nuevo ticket
            </a>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="recentTickets()" class="full-width">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Título</th>
                <td mat-cell *matCellDef="let t">
                  <a [routerLink]="['/tickets', t.id]" class="ticket-link">{{ t.title }}</a>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let t">
                  <mat-chip [class]="'status-' + t.status" [highlighted]="false">
                    {{ statusLabel(t.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Prioridad</th>
                <td mat-cell *matCellDef="let t">
                  <mat-chip [class]="'priority-' + t.priority" [highlighted]="false">
                    {{ t.priority }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="createdBy">
                <th mat-header-cell *matHeaderCellDef>Creador</th>
                <td mat-cell *matCellDef="let t">{{ t.createdByFullname || t.createdByUsername }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              @if (recentTickets().length === 0) {
                <tr class="mat-row"><td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 24px;">No hay tickets recientes</td></tr>
              }
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; align-items: center; height: 60vh; }
    .dashboard { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 24px; font-weight: 400; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 12px; padding: 16px; }
    .stat-card mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 500; line-height: 1.2; }
    .stat-label { font-size: 13px; opacity: 0.7; }
    .total { background: #e3f2fd; } .open { background: #fff3e0; } .progress { background: #e8f5e9; }
    .resolved { background: #e0f2f1; } .closed { background: #f3e5f5; }
    .low { background: #f1f8e9; } .medium { background: #fff8e1; } .high { background: #fbe9e7; }
    .recent-card { margin-top: 16px; }
    .recent-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .new-btn { display: flex; align-items: center; gap: 4px; }
    .full-width { width: 100%; }
    .ticket-link { text-decoration: none; color: #3f51b5; font-weight: 500; }
    .ticket-link:hover { text-decoration: underline; }
    .status-open { background: #fff3e0 !important; }
    .status-in_progress { background: #e8f5e9 !important; }
    .status-resolved { background: #e0f2f1 !important; }
    .status-closed { background: #f3e5f5 !important; }
    .priority-low { background: #f1f8e9 !important; }
    .priority-medium { background: #fff8e1 !important; }
    .priority-high { background: #fbe9e7 !important; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  data = signal<DashboardResponse | null>(null);
  recentTickets = signal<TicketInboxResponse[]>([]);
  displayedColumns = ['title', 'status', 'priority', 'createdBy'];

  ngOnInit() {
    this.dashboardService.get().subscribe({
      next: (res) => {
        this.data.set(res);
        this.recentTickets.set(res.recentTickets || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado' };
    return labels[status] || status;
  }
}
