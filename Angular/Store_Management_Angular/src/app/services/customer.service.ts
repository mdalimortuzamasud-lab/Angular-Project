import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CustomerRequestModel,
  CustomerResponseModel,
} from '../model/customer.model';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);

  private  apiUrl = environment.apiUrl+'customers';

  createCustomer(
    customer: CustomerRequestModel
  ): Observable<CustomerResponseModel> {
    return this.http.post<CustomerResponseModel>(this.apiUrl, customer);
  }

  updateCustomer(
    id: number,
    customer: CustomerRequestModel
  ): Observable<CustomerResponseModel> {
    return this.http.put<CustomerResponseModel>(
      `${this.apiUrl}/${id}`,
      customer
    );
  }

  getCustomerById(id: number): Observable<CustomerResponseModel> {
    return this.http.get<CustomerResponseModel>(
      `${this.apiUrl}/${id}`
    );
  }

  getAllCustomers(): Observable<CustomerResponseModel[]> {
    return this.http.get<CustomerResponseModel[]>(this.apiUrl);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}