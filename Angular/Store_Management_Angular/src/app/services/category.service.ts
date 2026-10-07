import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CategoryRequestModel, CategoryResponseModel } from '../model/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

 private http = inject(HttpClient);

  private apiUrl = environment.apiUrl +'categories';

   create(category: CategoryRequestModel): Observable<CategoryResponseModel> {
    return this.http.post<CategoryResponseModel>(this.apiUrl, category);
  }

  getAll(): Observable<CategoryResponseModel[]> {
    return this.http.get<CategoryResponseModel[]>(this.apiUrl);
  }

  getById(id: number): Observable<CategoryResponseModel> {
    return this.http.get<CategoryResponseModel>(`${this.apiUrl}/${id}`);
  }

  update(id: number, category: CategoryRequestModel): Observable<CategoryResponseModel> {
    return this.http.put<CategoryResponseModel>(
      `${this.apiUrl}/${id}`,
      category
    );
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }




}
