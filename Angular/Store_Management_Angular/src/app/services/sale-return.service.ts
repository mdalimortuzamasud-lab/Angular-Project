import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  SaleReturnRequest,
  SaleReturnResponse,
  SaleReturnItemRequest,
  SaleReturnItemResponse
} from '../model/sale-return.model';

@Injectable({
  providedIn: 'root'
})
export class SaleReturnService {

  private http = inject(HttpClient);

  // =========================
  // Sale Return API
  // =========================

  private saleReturnUrl =
    environment.apiUrl + 'sale-returns';

  // =========================
  // Sale Return Item API
  // =========================

  private saleReturnItemUrl =
    environment.apiUrl + 'sale-return-items';


  // ==================================================
  // SALE RETURN
  // ==================================================

  createSaleReturn(
    request: SaleReturnRequest
  ): Observable<SaleReturnResponse> {

    return this.http.post<SaleReturnResponse>(
      this.saleReturnUrl,
      request
    );
  }


  updateSaleReturn(
    id: number,
    request: SaleReturnRequest
  ): Observable<SaleReturnResponse> {

    return this.http.put<SaleReturnResponse>(
      `${this.saleReturnUrl}/${id}`,
      request
    );
  }


  getAllSaleReturns(): Observable<SaleReturnResponse[]> {

    return this.http.get<SaleReturnResponse[]>(
      this.saleReturnUrl
    );
  }


  getSaleReturnById(
    id: number
  ): Observable<SaleReturnResponse> {

    return this.http.get<SaleReturnResponse>(
      `${this.saleReturnUrl}/${id}`
    );
  }


  getSaleReturnsBySaleId(
    saleId: number
  ): Observable<SaleReturnResponse[]> {

    return this.http.get<SaleReturnResponse[]>(
      `${this.saleReturnUrl}/sale/${saleId}`
    );
  }


  deleteSaleReturn(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.saleReturnUrl}/${id}`,
      {
        responseType: 'text'
      }
    );
  }


  // ==================================================
  // SALE RETURN ITEMS
  // ==================================================

  createSaleReturnItem(
    request: SaleReturnItemRequest
  ): Observable<SaleReturnItemResponse> {

    return this.http.post<SaleReturnItemResponse>(
      this.saleReturnItemUrl,
      request
    );
  }


  updateSaleReturnItem(
    id: number,
    request: SaleReturnItemRequest
  ): Observable<SaleReturnItemResponse> {

    return this.http.put<SaleReturnItemResponse>(
      `${this.saleReturnItemUrl}/${id}`,
      request
    );
  }


  getAllSaleReturnItems(): Observable<SaleReturnItemResponse[]> {

    return this.http.get<SaleReturnItemResponse[]>(
      this.saleReturnItemUrl
    );
  }


  getSaleReturnItemById(
    id: number
  ): Observable<SaleReturnItemResponse> {

    return this.http.get<SaleReturnItemResponse>(
      `${this.saleReturnItemUrl}/${id}`
    );
  }


  getItemsBySaleReturnId(
    saleReturnId: number
  ): Observable<SaleReturnItemResponse[]> {

    return this.http.get<SaleReturnItemResponse[]>(
      `${this.saleReturnItemUrl}/sale-return/${saleReturnId}`
    );
  }
  


  deleteSaleReturnItem(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.saleReturnItemUrl}/${id}`,
      {
        responseType: 'text'
      }
    );
  }

}