import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SignalRService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, ToolbarComponent, SidebarComponent],
  template: `
    <mat-sidenav-container>
      <mat-sidenav #sidenav opened mode="side">
        <app-sidebar></app-sidebar>
      </mat-sidenav>
      <mat-sidenav-content>
        <app-toolbar (toggleSidebar)="sidenav.toggle()"></app-toolbar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    mat-sidenav-container { height: 100vh; }
    mat-sidenav { width: 240px; padding-top: 64px; }
    .content { padding: 24px; margin-top: 64px; }
  `]
})
export class MainLayoutComponent implements OnInit {
  private signalRService = inject(SignalRService);

  async ngOnInit() {
    try {
      await this.signalRService.start();
    } catch {
      console.warn('SignalR connection failed — will retry on next interaction');
    }
  }
}
