import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Purchase, PurchaseRequest, PurchaseStatus } from '../model/purchase.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

   private readonly baseUrl = `${environment.apiUrl}purchases`;

  constructor(private http: HttpClient) {}

  create(request: PurchaseRequest): Observable<Purchase> {
    return this.http.post<Purchase>(this.baseUrl, request);
  }

  getById(id: number): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(this.baseUrl);
  }

  getBySupplierId(supplierId: number): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.baseUrl}/supplier/${supplierId}`);
  }

  getByStatus(status: PurchaseStatus): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.baseUrl}/status/${status}`);
  }

  update(id: number, request: PurchaseRequest): Observable<Purchase> {
    return this.http.put<Purchase>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}