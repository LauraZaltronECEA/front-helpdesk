import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginDTO, LoginResponse, RegisterDTO, ForgotPasswordDTO, ResetPasswordDTO, GeneralResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'helpdesk_token';
  private userKey = 'helpdesk_user';

  login(dto: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(res => {
        if (res.estado && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res));
        }
      })
    );
  }

  register(dto: RegisterDTO): Observable<GeneralResponse> {
    return this.http.post<GeneralResponse>(`${this.apiUrl}/register`, dto);
  }

  forgotPassword(dto: ForgotPasswordDTO): Observable<GeneralResponse> {
    return this.http.post<GeneralResponse>(`${this.apiUrl}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDTO): Observable<GeneralResponse> {
    return this.http.post<GeneralResponse>(`${this.apiUrl}/reset-password`, dto);
  }

  confirmEmail(userId: number, token: string): Observable<GeneralResponse> {
    return this.http.get<GeneralResponse>(`${this.apiUrl}/confirm-email`, {
      params: { userId, token }
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): LoginResponse | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
