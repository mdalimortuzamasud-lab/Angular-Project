import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BranchRequest, BranchResponse } from '../model/branch.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BranchService {

private apiUrl = `${environment.apiUrl}branches`;

  constructor(private http: HttpClient) { }

  // Create
  create(branch: BranchRequest): Observable<BranchResponse> {
    return this.http.post<BranchResponse>(this.apiUrl, branch);
  }

  // Get All
  getAll(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(this.apiUrl);
  }

  // Get By Id
  getById(id: number): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.apiUrl}/${id}`);
  }

  // Update
  update(id: number, branch: BranchRequest): Observable<BranchResponse> {
    return this.http.put<BranchResponse>(`${this.apiUrl}/${id}`, branch);
  }

  // Delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text'
    });
  }

}
