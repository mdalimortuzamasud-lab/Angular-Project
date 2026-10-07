import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SaleItem, SaleItemRequest } from '../model/sale-item.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleItemService {

private readonly baseUrl = `${environment.apiUrl}sale-items`;

  constructor(private http: HttpClient) {}

  create(request: SaleItemRequest): Observable<SaleItem> {
    return this.http.post<SaleItem>(this.baseUrl, request);
  }

  // Sells multiple products in one call. Backend applies a stock OUT
  // movement per item (rolling back the whole batch if any item has
  // insufficient stock) and recalculates Sale.totalAmount/status after.
  createBatch(saleId: number, items: SaleItemRequest[]): Observable<SaleItem[]> {
    return this.http.post<SaleItem[]>(`${this.baseUrl}/batch/${saleId}`, items);
  }

  getById(id: number): Observable<SaleItem> {
    return this.http.get<SaleItem>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(this.baseUrl);
  }

  getBySaleId(saleId: number): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(`${this.baseUrl}/sale/${saleId}`);
  }

  update(id: number, request: SaleItemRequest): Observable<SaleItem> {
    return this.http.put<SaleItem>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  
}
