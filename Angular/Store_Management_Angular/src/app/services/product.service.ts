import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ProductRequestModel,
  ProductResponseModel
} from '../model/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl +'products';
  

  // Create Product
  createProduct(
    product: ProductRequestModel
  ): Observable<ProductResponseModel> {
    return this.http.post<ProductResponseModel>(this.apiUrl, product);
  }

  // Get All Products
  getAllProducts(): Observable<ProductResponseModel[]> {
    return this.http.get<ProductResponseModel[]>(this.apiUrl);
  }

  // Get Product By Id
  getProductById(id: number): Observable<ProductResponseModel> {
    return this.http.get<ProductResponseModel>(
      `${this.apiUrl}/${id}`
    );
  }

  // Update Product
  updateProduct(
    id: number,
    product: ProductRequestModel
  ): Observable<ProductResponseModel> {
    return this.http.put<ProductResponseModel>(
      `${this.apiUrl}/${id}`,
      product
    );
  }

  // Delete Product
  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }
}