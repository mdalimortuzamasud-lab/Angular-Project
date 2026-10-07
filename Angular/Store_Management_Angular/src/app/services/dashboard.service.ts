import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../model/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = 'http://localhost:8085/api/dashboards';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(this.baseUrl);
  }
}