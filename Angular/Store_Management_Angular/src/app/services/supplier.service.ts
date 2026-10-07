import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SupplierRequestModel, SupplierResponseModel } from '../model/supplier.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
 private http = inject(HttpClient);

 private  apiUrl = environment.apiUrl+'suppliers';

  createSupplier(
    supplier: SupplierRequestModel
  ): Observable<SupplierResponseModel> {
    return this.http.post<SupplierResponseModel>(this.apiUrl, supplier);
  }

  getAllSuppliers(): Observable<SupplierResponseModel[]> {
    return this.http.get<SupplierResponseModel[]>(this.apiUrl);
  }

  getSupplierById(id: number): Observable<SupplierResponseModel> {
    return this.http.get<SupplierResponseModel>(`${this.apiUrl}/${id}`);
  }

  updateSupplier(
    id: number,
    supplier: SupplierRequestModel
  ): Observable<SupplierResponseModel> {
    return this.http.put<SupplierResponseModel>(
      `${this.apiUrl}/${id}`,
      supplier
    );
  }

  deleteSupplier(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }





}
