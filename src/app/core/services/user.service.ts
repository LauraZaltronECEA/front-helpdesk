import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserListResponse, UpdateUserRoleDTO, UpdateUserAreaDTO } from '../models/user.model';
import { GeneralResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;

  getAll(): Observable<UserListResponse[]> {
    return this.http.get<UserListResponse[]>(this.apiUrl);
  }

  updateRole(id: number, dto: UpdateUserRoleDTO): Observable<GeneralResponse> {
    return this.http.put<GeneralResponse>(`${this.apiUrl}/${id}/role`, dto);
  }

  updateArea(id: number, dto: UpdateUserAreaDTO): Observable<GeneralResponse> {
    return this.http.put<GeneralResponse>(`${this.apiUrl}/${id}/area`, dto);
  }
}
