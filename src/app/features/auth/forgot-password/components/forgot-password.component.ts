import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="forgot-container">
      <mat-card class="forgot-card">
        <mat-card-header>
          <mat-card-title>Recuperar contraseña</mat-card-title>
          <mat-card-subtitle>Ingresa tu email para recibir un enlace de recuperación</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #forgotForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required email
                     [disabled]="loading()">
              <mat-icon matIconPrefix>email</mat-icon>
            </mat-form-field>
            @if (error()) {
              <mat-error class="error-msg">{{ error() }}</mat-error>
            }
            @if (success()) {
              <mat-hint class="success-msg">{{ success() }}</mat-hint>
            }
            <button mat-raised-button color="primary" class="full-width"
                    type="submit" [disabled]="loading() || !forgotForm.form.valid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Enviar enlace
              }
            </button>
          </form>
          <div class="auth-links">
            <a routerLink="/login" mat-button>Volver al login</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
    .forgot-card { max-width: 400px; width: 100%; margin: 16px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .error-msg { display: block; margin-bottom: 16px; }
    .success-msg { display: block; margin-bottom: 16px; color: #4caf50; }
    .auth-links { margin-top: 16px; text-align: center; }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  onSubmit() {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        if (res.estado) {
          this.success.set(res.mensaje || 'Revisa tu email para continuar.');
        } else {
          this.error.set(res.mensaje || 'Error al enviar el enlace');
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
