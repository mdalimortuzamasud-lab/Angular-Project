import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  CustomerPaymentRequestModel,
  CustomerPaymentResponseModel,
  Sale,
  SaleStatus
} from '../model/customer-payment.model';


// =====================================================
// CUSTOMER PAYMENT SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class CustomerPaymentService {

  private http = inject(HttpClient);

  private paymentUrl =
    environment.apiUrl + 'customer-payments';

  private saleUrl =
    environment.apiUrl + 'sales';


  // =====================================================
  // CREATE CUSTOMER PAYMENT
  // =====================================================

  createPayment(
    payment: CustomerPaymentRequestModel
  ): Observable<CustomerPaymentResponseModel> {

    return this.http.post<CustomerPaymentResponseModel>(
      this.paymentUrl,
      payment
    );
  }


  // =====================================================
  // UPDATE CUSTOMER PAYMENT
  // =====================================================

  updatePayment(
    id: number,
    payment: CustomerPaymentRequestModel
  ): Observable<CustomerPaymentResponseModel> {

    return this.http.put<CustomerPaymentResponseModel>(
      `${this.paymentUrl}/${id}`,
      payment
    );
  }


  // =====================================================
  // GET PAYMENT BY ID
  // =====================================================

  getPaymentById(
    id: number
  ): Observable<CustomerPaymentResponseModel> {

    return this.http.get<CustomerPaymentResponseModel>(
      `${this.paymentUrl}/${id}`
    );
  }


  // =====================================================
  // GET ALL PAYMENTS
  // =====================================================

  getAllPayments(): Observable<CustomerPaymentResponseModel[]> {

    return this.http.get<CustomerPaymentResponseModel[]>(
      this.paymentUrl
    );
  }


  // =====================================================
  // GET PAYMENTS BY CUSTOMER
  // =====================================================

  getPaymentsByCustomerId(
    customerId: number
  ): Observable<CustomerPaymentResponseModel[]> {

    return this.http.get<CustomerPaymentResponseModel[]>(
      `${this.paymentUrl}/customer/${customerId}`
    );
  }


  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  deletePayment(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.paymentUrl}/${id}`
    );
  }


  // =====================================================
  // SALE
  // =====================================================


  // =====================================================
  // GET SALE BY ID
  // =====================================================

  getSaleById(
    id: number
  ): Observable<Sale> {

    return this.http.get<Sale>(
      `${this.saleUrl}/${id}`
    );
  }


  // =====================================================
  // GET ALL SALES
  // =====================================================

  getAllSales(): Observable<Sale[]> {

    return this.http.get<Sale[]>(
      this.saleUrl
    );
  }


  // =====================================================
  // GET SALES BY CUSTOMER
  // =====================================================

  getSalesByCustomerId(
    customerId: number
  ): Observable<Sale[]> {

    return this.http.get<Sale[]>(
      `${this.saleUrl}/customer/${customerId}`
    );
  }


  // =====================================================
  // GET SALES BY STATUS
  // =====================================================

  getSalesByStatus(
    status: SaleStatus
  ): Observable<Sale[]> {

    return this.http.get<Sale[]>(
      `${this.saleUrl}/status/${status}`
    );
  }


  // =====================================================
  // UPDATE SALE
  // =====================================================

  updateSale(
    id: number,
    sale: any
  ): Observable<Sale> {

    return this.http.put<Sale>(
      `${this.saleUrl}/${id}`,
      sale
    );
  }


  // =====================================================
  // DELETE SALE
  // =====================================================

  deleteSale(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.saleUrl}/${id}`,
      {
        responseType: 'text'
      }
    );
  }

}