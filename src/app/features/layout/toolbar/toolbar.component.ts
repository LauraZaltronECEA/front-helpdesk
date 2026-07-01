import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">HelpDesk</span>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <span mat-menu-item disabled>
          <mat-icon>person</mat-icon>
          {{ user?.fullname || user?.username }}
        </span>
        <span mat-menu-item disabled>
          <mat-icon>badge</mat-icon>
          {{ user?.role }}
        </span>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          Cerrar sesión
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .app-title { margin-left: 8px; font-weight: 500; }
    .spacer { flex: 1 1 auto; }
    mat-toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  `]
})
export class ToolbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  toggleSidebar = output<void>();

  get user() { return this.authService.getUser(); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
