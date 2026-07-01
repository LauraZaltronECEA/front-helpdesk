import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { SignalRService } from '../../../../core/services/signalr.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar sesión</mat-card-title>
          <mat-card-subtitle>HelpDesk</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput [(ngModel)]="username" name="username" required
                     [disabled]="loading()" autocomplete="username">
              <mat-icon matIconPrefix>person</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [(ngModel)]="password" name="password" required
                     [type]="hidePassword() ? 'password' : 'text'"
                     [disabled]="loading()" autocomplete="current-password">
              <mat-icon matIconPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
            @if (error()) {
              <mat-error class="error-msg">{{ error() }}</mat-error>
            }
            <button mat-raised-button color="primary" class="full-width"
                    type="submit" [disabled]="loading() || !loginForm.form.valid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Ingresar
              }
            </button>
          </form>
          <div class="auth-links">
            <a routerLink="/register" mat-button color="accent">Crear cuenta</a>
            <a routerLink="/forgot-password" mat-button>Olvidé mi contraseña</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
    .login-card { max-width: 400px; width: 100%; margin: 16px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .error-msg { display: block; margin-bottom: 16px; }
    .auth-links { display: flex; justify-content: space-between; margin-top: 16px; }
    mat-card-title { font-size: 1.5rem; margin-bottom: 8px; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private router = inject(Router);

  username = '';
  password = '';
  hidePassword = signal(true);
  loading = signal(false);
  error = signal('');

  async onSubmit() {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: async (res) => {
          if (res.estado) {
            try { await this.signalRService.start(); } catch { /* will retry in main-layout */ }
            this.router.navigate(['/dashboard']);
          } else {
            this.error.set(res.mensaje || 'Error al iniciar sesión');
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.mensaje || 'Error de conexión');
          this.loading.set(false);
        }
      });
  }
}
