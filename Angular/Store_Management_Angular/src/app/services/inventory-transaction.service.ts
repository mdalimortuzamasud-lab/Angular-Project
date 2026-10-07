import { Injectable } from '@angular/core';
import { InventoryTransaction, InventoryTransactionType } from '../model/inventory-transaction.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InventoryTransactionService {

  private readonly baseUrl = `${environment.apiUrl}inventory-transactions`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<InventoryTransaction> {
    return this.http.get<InventoryTransaction>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(this.baseUrl);
  }

  getByProductId(productId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.baseUrl}/product/${productId}`);
  }

  getByWarehouseId(warehouseId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.baseUrl}/warehouse/${warehouseId}`);
  }

  getByType(type: InventoryTransactionType): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.baseUrl}/type/${type}`);
  }

  // e.g. pass a Purchase id to see exactly which stock movements it caused
  getByReferenceId(referenceId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.baseUrl}/reference/${referenceId}`);
  }

  getByProductIdAndWarehouseId(productId: number, warehouseId: number): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(
      `${this.baseUrl}/product/${productId}/warehouse/${warehouseId}`
    );
  }

}
