import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Nuevo ticket</h2>
    <mat-dialog-content>
      <form #form="ngForm" class="ticket-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Título</mat-label>
          <input matInput [(ngModel)]="title" name="title" required maxlength="200"
                 [disabled]="loading()" autofocus>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput [(ngModel)]="description" name="description" required maxlength="4000"
                    rows="5" [disabled]="loading()"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Prioridad</mat-label>
          <mat-select [(value)]="priority" name="priority" required [disabled]="loading()">
            <mat-option value="low">Baja</mat-option>
            <mat-option value="medium">Media</mat-option>
            <mat-option value="high">Alta</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="loading()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()"
              [disabled]="loading() || !title || !description || !priority">
        @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
        @else { Crear ticket }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ticket-form { display: flex; flex-direction: column; gap: 16px; min-width: 450px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class TicketFormComponent {
  private dialogRef = inject(MatDialogRef<TicketFormComponent>);
  private ticketService = inject(TicketService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  title = '';
  description = '';
  priority = 'medium';
  loading = signal(false);

  onSubmit() {
    if (!this.title || !this.description) return;
    this.loading.set(true);

    this.ticketService.create({ title: this.title, description: this.description, priority: this.priority })
      .subscribe({
        next: (res) => {
          if (res.estado) {
            this.snackBar.open('Ticket creado con éxito', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(true);
            if (res.ticketId) {
              this.router.navigate(['/tickets', res.ticketId]);
            }
          } else {
            this.snackBar.open(res.mensaje || 'Error al crear', 'Cerrar', { duration: 3000 });
          }
          this.loading.set(false);
        },
        error: () => {
          this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 });
          this.loading.set(false);
        }
      });
  }
}
