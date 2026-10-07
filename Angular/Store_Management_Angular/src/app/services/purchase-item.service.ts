import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PurchaseItem, PurchaseItemRequest } from '../model/purchase-item.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PurchaseItemService {


private readonly baseUrl = `${environment.apiUrl}purchase-items`;

  constructor(private http: HttpClient) {}

  create(request: PurchaseItemRequest): Observable<PurchaseItem> {
    return this.http.post<PurchaseItem>(this.baseUrl, request);
  }

  // Adds multiple products to one purchase in a single call.
  // Backend recalculates Purchase.totalAmount/status after saving.
  createBatch(purchaseId: number, items: PurchaseItemRequest[]): Observable<PurchaseItem[]> {
    return this.http.post<PurchaseItem[]>(`${this.baseUrl}/batch/${purchaseId}`, items);
  }

  getById(id: number): Observable<PurchaseItem> {
    return this.http.get<PurchaseItem>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(this.baseUrl);
  }



  getByProductId(productId: number): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(`${this.baseUrl}/product/${productId}`);
  }

  update(id: number, request: PurchaseItemRequest): Observable<PurchaseItem> {
    return this.http.put<PurchaseItem>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

   getByPurchaseId(purchaseId: number): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(`${this.baseUrl}/purchase/${purchaseId}`);
  }

}
