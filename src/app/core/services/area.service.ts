import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area } from '../models/area.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/area`;

  getAll(): Observable<Area[]> {
    return this.http.get<Area[]>(this.apiUrl);
  }
}
