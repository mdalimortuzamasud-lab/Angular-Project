import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Sale, SaleRequest } from '../model/sale.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {

private readonly baseUrl = `${environment.apiUrl}sales`;

  constructor(private http: HttpClient) {}

  create(request: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, request);
  }

  getById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.baseUrl);
  }

  getByCustomerId(customerId: number): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  update(id: number, request: SaleRequest): Observable<Sale> {
    return this.http.put<Sale>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
