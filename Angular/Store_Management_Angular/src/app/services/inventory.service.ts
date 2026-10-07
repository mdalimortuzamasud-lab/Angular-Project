import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inventory, InventoryRequest } from '../model/inventory.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {

 private readonly baseUrl = `${environment.apiUrl}inventories`;

  constructor(private http: HttpClient) {}

  // Manual creation of an inventory row (e.g. to pre-seed a
  // product/warehouse combo before any purchase happens). Most of the
  // time you won't need this — StockMovementService creates rows
  // automatically the first time a purchase/sale/etc. touches them.
  create(request: InventoryRequest): Observable<Inventory> {
    return this.http.post<Inventory>(this.baseUrl, request);
  }

  getById(id: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.baseUrl);
  }

  getByWarehouseId(warehouseId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/warehouse/${warehouseId}`);
  }

  getByProductId(productId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/product/${productId}`);
  }

  update(id: number, request: InventoryRequest): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
