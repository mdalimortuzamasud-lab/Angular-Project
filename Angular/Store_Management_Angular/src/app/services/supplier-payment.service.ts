import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  SupplierPaymentRequestModel,
  SupplierPaymentResponseModel
} from '../model/supplier-payment.model';

import {
  PurchaseRequest,
  Purchase,
  PurchaseStatus
} from '../model/purchase.model';


// =====================================================
// SUPPLIER PAYMENT SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class SupplierPaymentService {

  private http = inject(HttpClient);

  private paymentUrl =
    environment.apiUrl + 'supplier-payments';

  private purchaseUrl =
    environment.apiUrl + 'purchases';


  // =========================
  // CREATE PAYMENT
  // =========================

  createPayment(
    payment: SupplierPaymentRequestModel
  ): Observable<SupplierPaymentResponseModel> {

    return this.http.post<SupplierPaymentResponseModel>(
      this.paymentUrl,
      payment
    );
  }


  // =========================
  // UPDATE PAYMENT
  // =========================

  updatePayment(
    id: number,
    payment: SupplierPaymentRequestModel
  ): Observable<SupplierPaymentResponseModel> {

    return this.http.put<SupplierPaymentResponseModel>(
      `${this.paymentUrl}/${id}`,
      payment
    );
  }


  // =========================
  // GET PAYMENT BY ID
  // =========================

  getPaymentById(
    id: number
  ): Observable<SupplierPaymentResponseModel> {

    return this.http.get<SupplierPaymentResponseModel>(
      `${this.paymentUrl}/${id}`
    );
  }


  // =========================
  // GET ALL PAYMENTS
  // =========================

  getAllPayments():

    Observable<SupplierPaymentResponseModel[]> {

    return this.http.get<SupplierPaymentResponseModel[]>(
      this.paymentUrl
    );
  }


  // =========================
  // GET PAYMENTS BY SUPPLIER
  // =========================

  getPaymentsBySupplierId(
    supplierId: number
  ): Observable<SupplierPaymentResponseModel[]> {

    return this.http.get<SupplierPaymentResponseModel[]>(
      `${this.paymentUrl}/supplier/${supplierId}`
    );
  }


  // =========================
  // DELETE PAYMENT
  // =========================

  deletePayment(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.paymentUrl}/${id}`
    );
  }


  // =====================================================
  // PURCHASE
  // =====================================================


  // =========================
  // CREATE PURCHASE
  // =========================

  createPurchase(
    purchase: PurchaseRequest
  ): Observable<Purchase> {

    return this.http.post<Purchase>(
      this.purchaseUrl,
      purchase
    );
  }


  // =========================
  // GET PURCHASE BY ID
  // =========================

  getPurchaseById(
    id: number
  ): Observable<Purchase> {

    return this.http.get<Purchase>(
      `${this.purchaseUrl}/${id}`
    );
  }


  // =========================
  // GET ALL PURCHASES
  // =========================

  getAllPurchases():

    Observable<Purchase[]> {

    return this.http.get<Purchase[]>(
      this.purchaseUrl
    );
  }


  // =========================
  // GET PURCHASES BY SUPPLIER
  // =========================

  getPurchasesBySupplierId(
    supplierId: number
  ): Observable<Purchase[]> {

    return this.http.get<Purchase[]>(
      `${this.purchaseUrl}/supplier/${supplierId}`
    );
  }


  // =========================
  // GET PURCHASES BY STATUS
  // =========================

  getPurchasesByStatus(
    status: PurchaseStatus
  ): Observable<Purchase[]> {

    return this.http.get<Purchase[]>(
      `${this.purchaseUrl}/status/${status}`
    );
  }


  // =========================
  // UPDATE PURCHASE
  // =========================

  updatePurchase(
    id: number,
    purchase: PurchaseRequest
  ): Observable<Purchase> {

    return this.http.put<Purchase>(
      `${this.purchaseUrl}/${id}`,
      purchase
    );
  }


  // =========================
  // DELETE PURCHASE
  // =========================

  deletePurchase(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.purchaseUrl}/${id}`,
      {
        responseType: 'text'
      }
    );
  }

}