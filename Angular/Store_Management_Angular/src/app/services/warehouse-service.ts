import { Injectable } from '@angular/core';
import { WarehouseRequest, WarehouseResponse } from '../model/warehouse.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {

  private apiUrl = `${environment.apiUrl}warehouses`;

  constructor(private http: HttpClient) { }

  // Create
  create(data: WarehouseRequest): Observable<WarehouseResponse> {
    return this.http.post<WarehouseResponse>(this.apiUrl, data);
  }

  // Get All
  getAll(): Observable<WarehouseResponse[]> {
    return this.http.get<WarehouseResponse[]>(this.apiUrl);
  }

  // Get By Id
  getById(id: number): Observable<WarehouseResponse> {
    return this.http.get<WarehouseResponse>(`${this.apiUrl}/${id}`);
  }

  // Get By Branch
  getByBranch(branchId: number): Observable<WarehouseResponse[]> {
    return this.http.get<WarehouseResponse[]>(
      `${this.apiUrl}/branch/${branchId}`
    );
  }

  // Update
  update(id: number, data: WarehouseRequest): Observable<WarehouseResponse> {
    return this.http.put<WarehouseResponse>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  // Delete
  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }


}
