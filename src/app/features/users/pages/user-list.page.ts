import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { AreaService } from '../../../core/services/area.service';
import { UserListResponse } from '../../../core/models/user.model';
import { Area } from '../../../core/models/area.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="loading-container"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="users-page">
        <h1>Usuarios</h1>
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="users()" class="full-width">
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Usuario</th>
                <td mat-cell *matCellDef="let u">{{ u.username }}</td>
              </ng-container>
              <ng-container matColumnDef="fullname">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let u">{{ u.fullname }}</td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let u">{{ u.email }}</td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let u">
                  <mat-select [value]="u.role" (selectionChange)="changeRole(u, $event.value)"
                              class="role-select">
                    <mat-option value="viewer">Viewer</mat-option>
                    <mat-option value="agent">Agent</mat-option>
                    <mat-option value="admin">Admin</mat-option>
                  </mat-select>
                </td>
              </ng-container>
              <ng-container matColumnDef="area">
                <th mat-header-cell *matHeaderCellDef>Área</th>
                <td mat-cell *matCellDef="let u">
                  <mat-select [value]="u.areaId" (selectionChange)="changeArea(u, $event.value)" class="area-select">
                    <mat-option [value]="null">Sin área</mat-option>
                    @for (a of areas(); track a.id) {
                      <mat-option [value]="a.id">{{ a.area_Name }}</mat-option>
                    }
                  </mat-select>
                </td>
              </ng-container>
              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Activo</th>
                <td mat-cell *matCellDef="let u">{{ u.active ? 'Sí' : 'No' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              @if (users().length === 0) {
                <tr class="mat-row"><td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:24px;">No hay usuarios</td></tr>
              }
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; padding: 80px; }
    .users-page { max-width: 1000px; margin: 0 auto; }
    h1 { font-weight: 400; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .role-select { width: 120px; }
    .area-select { width: 140px; }
  `]
})
export class UserListPage implements OnInit {
  private userService = inject(UserService);
  private areaService = inject(AreaService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  users = signal<UserListResponse[]>([]);
  areas = signal<Area[]>([]);
  displayedColumns = ['username', 'fullname', 'email', 'role', 'area', 'active'];

  ngOnInit() {
    this.loadAreas();
    this.loadUsers();
  }

  loadAreas() {
    this.areaService.getAll().subscribe({
      next: (res) => this.areas.set(res)
    });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (res) => { this.users.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  changeRole(user: UserListResponse, newRole: string) {
    this.userService.updateRole(user.userId, { role: newRole }).subscribe({
      next: (res) => {
        if (res.estado) {
          this.snackBar.open(`Rol de ${user.username} actualizado a ${newRole}`, 'Cerrar', { duration: 3000 });
          this.loadUsers();
        } else {
          this.snackBar.open(res.mensaje || 'Error', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        }
      },
      error: () => this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 })
    });
  }

  changeArea(user: UserListResponse, areaId: number | null) {
    this.userService.updateArea(user.userId, { areaId }).subscribe({
      next: (res) => {
        if (res.estado) {
          this.snackBar.open(`Área de ${user.username} actualizada`, 'Cerrar', { duration: 3000 });
          this.loadUsers();
        } else {
          this.snackBar.open(res.mensaje || 'Error', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        }
      },
      error: () => this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 })
    });
  }
}
