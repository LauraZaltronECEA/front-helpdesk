import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { AreaService } from '../../../../core/services/area.service';
import { Area } from '../../../../core/models/area.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear cuenta</mat-card-title>
          <mat-card-subtitle>HelpDesk</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #registerForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput [(ngModel)]="fullname" name="fullname" required
                     [disabled]="loading()">
              <mat-icon matIconPrefix>badge</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput [(ngModel)]="username" name="username" required
                     [disabled]="loading()">
              <mat-icon matIconPrefix>person</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required email
                     [disabled]="loading()">
              <mat-icon matIconPrefix>email</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [(ngModel)]="password" name="password" required
                     [type]="hidePassword() ? 'password' : 'text'" minlength="6"
                     [disabled]="loading()">
              <mat-icon matIconPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Área</mat-label>
              <mat-select [(ngModel)]="areaId" name="areaId" [disabled]="loading()">
                <mat-option [value]="null">Sin área</mat-option>
                @for (area of areas(); track area.id) {
                  <mat-option [value]="area.id">{{ area.area_Name }}</mat-option>
                }
              </mat-select>
              <mat-icon matIconPrefix>business</mat-icon>
            </mat-form-field>
            @if (error()) {
              <mat-error class="error-msg">{{ error() }}</mat-error>
            }
            @if (success()) {
              <mat-hint class="success-msg">{{ success() }}</mat-hint>
            }
            <button mat-raised-button color="primary" class="full-width"
                    type="submit" [disabled]="loading() || !registerForm.form.valid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Registrarse
              }
            </button>
          </form>
          <div class="auth-links">
            <a routerLink="/login" mat-button>Ya tengo cuenta</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .register-card { max-width: 450px; width: 100%; margin: 16px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .error-msg { display: block; margin-bottom: 16px; }
    .success-msg { display: block; margin-bottom: 16px; color: #4caf50; }
    .auth-links { margin-top: 16px; text-align: center; }
  `]
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private areaService = inject(AreaService);
  private router = inject(Router);

  username = '';
  password = '';
  email = '';
  fullname = '';
  areaId: number | null = null;
  hidePassword = signal(true);
  loading = signal(false);
  error = signal('');
  success = signal('');
  areas = signal<Area[]>([]);

  ngOnInit() {
    this.areaService.getAll().subscribe({
      next: (res) => this.areas.set(res)
    });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.register({
      username: this.username,
      password: this.password,
      email: this.email,
      fullname: this.fullname,
      areaId: this.areaId
    }).subscribe({
      next: (res) => {
        if (res.estado) {
          this.success.set('Cuenta creada con éxito. Revisa tu email para confirmar.');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.error.set(res.mensaje || 'Error al registrarse');
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
