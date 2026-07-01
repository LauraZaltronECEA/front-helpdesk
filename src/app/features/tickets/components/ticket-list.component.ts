import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketInboxResponse } from '../../../core/models/ticket.model';
import { TicketFormComponent } from './ticket-form.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, MatTableModule, MatChipsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatPaginatorModule, MatSortModule],
  template: `
    @if (loading()) {
      <div class="loading-container"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="ticket-list">
        <div class="header">
          <h1>Tickets</h1>
          <button mat-raised-button color="primary" (click)="openCreate()">
            <mat-icon>add</mat-icon> Nuevo ticket
          </button>
        </div>

        <div class="filters">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Título...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Estado</mat-label>
            <mat-select [(value)]="statusFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="open">Abierto</mat-option>
              <mat-option value="in_progress">En progreso</mat-option>
              <mat-option value="resolved">Resuelto</mat-option>
              <mat-option value="closed">Cerrado</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Prioridad</mat-label>
            <mat-select [(value)]="priorityFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option value="low">Baja</mat-option>
              <mat-option value="medium">Media</mat-option>
              <mat-option value="high">Alta</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <table mat-table [dataSource]="dataSource" matSort class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>#</th>
            <td mat-cell *matCellDef="let t">{{ t.id }}</td>
          </ng-container>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Título</th>
            <td mat-cell *matCellDef="let t">
              <a [routerLink]="['/tickets', t.id]" class="ticket-link">{{ t.title }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
            <td mat-cell *matCellDef="let t">
              <mat-chip [class]="'status-' + t.status">{{ statusLabel(t.status) }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Prioridad</th>
            <td mat-cell *matCellDef="let t">
              <mat-chip [class]="'priority-' + t.priority">{{ t.priority }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="createdBy">
            <th mat-header-cell *matHeaderCellDef>Creador</th>
            <td mat-cell *matCellDef="let t">{{ t.createdByFullname || t.createdByUsername }}</td>
          </ng-container>
          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>Asignado</th>
            <td mat-cell *matCellDef="let t">{{ t.assignedToFullname || t.assignedToUsername || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
            <td mat-cell *matCellDef="let t">{{ t.createdAt | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acción</th>
            <td mat-cell *matCellDef="let t">
              <button mat-icon-button color="primary" [routerLink]="['/tickets', t.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              @if (isAdmin()) {
                <button mat-icon-button color="warn" (click)="deleteTicket(t.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          @if (dataSource.filteredData.length === 0) {
            <tr class="mat-row"><td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:24px;">No se encontraron tickets</td></tr>
          }
        </table>
        <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; padding: 80px; }
    .ticket-list { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header h1 { font-weight: 400; margin: 0; }
    .filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
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
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  searchText = '';
  statusFilter = '';
  priorityFilter = '';
  dataSource = new MatTableDataSource<TicketInboxResponse>([]);
  displayedColumns = ['id', 'title', 'status', 'priority', 'createdBy', 'assignedTo', 'createdAt', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getInbox().subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter() {
    this.dataSource.filterPredicate = (data: TicketInboxResponse, _filter: string) => {
      const matchSearch = !this.searchText || data.title.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = !this.statusFilter || data.status === this.statusFilter;
      const matchPriority = !this.priorityFilter || data.priority === this.priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    };
    this.dataSource.filter = Math.random().toString();
  }

  openCreate() {
    const ref = this.dialog.open(TicketFormComponent, { width: '550px' });
    ref.afterClosed().subscribe(result => { if (result) this.loadTickets(); });
  }

  deleteTicket(id: number) {
    if (confirm('¿Eliminar este ticket?')) {
      this.ticketService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Ticket eliminado', 'Cerrar', { duration: 3000 });
          this.loadTickets();
        }
      });
    }
  }

  isAdmin() { return this.authService.getUser()?.role === 'admin'; }
  statusLabel(s: string) { const labels: Record<string, string> = { open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado' }; return labels[s] || s; }
}
