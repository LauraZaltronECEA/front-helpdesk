import { Component, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <mat-nav-list>
      <mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </mat-list-item>
      <mat-list-item routerLink="/tickets" routerLinkActive="active-link">
        <mat-icon matListItemIcon>confirmation_number</mat-icon>
        <span matListItemTitle>Tickets</span>
      </mat-list-item>
      @if (isAdmin()) {
        <mat-list-item routerLink="/users" routerLinkActive="active-link">
          <mat-icon matListItemIcon>people</mat-icon>
          <span matListItemTitle>Usuarios</span>
        </mat-list-item>
      }
    </mat-nav-list>
  `,
  styles: [`
    .active-link {
      background: rgba(0, 0, 0, 0.04);
      border-left: 3px solid #3f51b5;
    }
    mat-list-item { cursor: pointer; }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isAdmin(): boolean {
    return this.authService.getUser()?.role === 'admin';
  }
}
