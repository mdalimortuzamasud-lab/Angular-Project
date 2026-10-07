import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PurchaseReturnRequest,
  PurchaseReturnResponse,
  PurchaseReturnItemRequest,
  PurchaseReturnItemResponse
} from '../model/purchase-return.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseReturnService {

  private readonly purchaseReturnUrl = 'http://localhost:8085/api/purchase-returns';
  private readonly purchaseReturnItemUrl = 'http://localhost:8085/api/purchase-return-items';

  constructor(private http: HttpClient) {}

  // ===========================
  // Purchase Return
  // ===========================

  createPurchaseReturn(
    request: PurchaseReturnRequest
  ): Observable<PurchaseReturnResponse> {
    return this.http.post<PurchaseReturnResponse>(
      this.purchaseReturnUrl,
      request
    );
  }

  getPurchaseReturnById(
    id: number
  ): Observable<PurchaseReturnResponse> {
    return this.http.get<PurchaseReturnResponse>(
      `${this.purchaseReturnUrl}/${id}`
    );
  }

  getAllPurchaseReturns(): Observable<PurchaseReturnResponse[]> {
    return this.http.get<PurchaseReturnResponse[]>(
      this.purchaseReturnUrl
    );
  }

  getPurchaseReturnsByPurchaseId(
    purchaseId: number
  ): Observable<PurchaseReturnResponse[]> {
    return this.http.get<PurchaseReturnResponse[]>(
      `${this.purchaseReturnUrl}/purchase/${purchaseId}`
    );
  }

  updatePurchaseReturn(
    id: number,
    request: PurchaseReturnRequest
  ): Observable<PurchaseReturnResponse> {
    return this.http.put<PurchaseReturnResponse>(
      `${this.purchaseReturnUrl}/${id}`,
      request
    );
  }

  deletePurchaseReturn(id: number): Observable<string> {
    return this.http.delete(`${this.purchaseReturnUrl}/${id}`, {
      responseType: 'text'
    });
  }

  // ===========================
  // Purchase Return Items
  // ===========================

  createPurchaseReturnItem(
    request: PurchaseReturnItemRequest
  ): Observable<PurchaseReturnItemResponse> {
    return this.http.post<PurchaseReturnItemResponse>(
      this.purchaseReturnItemUrl,
      request
    );
  }

  getPurchaseReturnItemById(
    id: number
  ): Observable<PurchaseReturnItemResponse> {
    return this.http.get<PurchaseReturnItemResponse>(
      `${this.purchaseReturnItemUrl}/${id}`
    );
  }

  getAllPurchaseReturnItems(): Observable<PurchaseReturnItemResponse[]> {
    return this.http.get<PurchaseReturnItemResponse[]>(
      this.purchaseReturnItemUrl
    );
  }

  getPurchaseReturnItemsByPurchaseReturnId(
    purchaseReturnId: number
  ): Observable<PurchaseReturnItemResponse[]> {
    return this.http.get<PurchaseReturnItemResponse[]>(
      `${this.purchaseReturnItemUrl}/purchase-return/${purchaseReturnId}`
    );
  }

  getPurchaseReturnItemsByProductId(
    productId: number
  ): Observable<PurchaseReturnItemResponse[]> {
    return this.http.get<PurchaseReturnItemResponse[]>(
      `${this.purchaseReturnItemUrl}/product/${productId}`
    );
  }

  updatePurchaseReturnItem(
    id: number,
    request: PurchaseReturnItemRequest
  ): Observable<PurchaseReturnItemResponse> {
    return this.http.put<PurchaseReturnItemResponse>(
      `${this.purchaseReturnItemUrl}/${id}`,
      request
    );
  }

  deletePurchaseReturnItem(id: number): Observable<string> {
    return this.http.delete(`${this.purchaseReturnItemUrl}/${id}`, {
      responseType: 'text'
    });
  }

  
}