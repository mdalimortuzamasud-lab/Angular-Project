import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  RoleRequestModel,
  RoleResponseModel
} from '../model/role.model';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl + 'roles';

  private  baseUrl =
    environment.apiUrl + 'roles';


  // =========================================================
  // CREATE ROLE
  // POST /api/roles
  // =========================================================

  createRole(
    role: RoleRequestModel
  ): Observable<RoleResponseModel> {

    return this.http.post<RoleResponseModel>(
      this.apiUrl,
      role
    );
  }


  // =========================================================
  // UPDATE ROLE
  // PUT /api/roles/{id}
  // =========================================================

  updateRole(
    id: number,
    role: RoleRequestModel
  ): Observable<RoleResponseModel> {

    return this.http.put<RoleResponseModel>(
      `${this.apiUrl}/${id}`,
      role
    );
  }


  // =========================================================
  // GET ROLE BY ID
  // GET /api/roles/{id}
  // =========================================================

  getRoleById(
    id: number
  ): Observable<RoleResponseModel> {

    return this.http.get<RoleResponseModel>(
      `${this.apiUrl}/${id}`
    );
  }


  // =========================================================
  // GET ALL ROLES
  // GET /api/roles
  // =========================================================

  getAllRoles(): Observable<RoleResponseModel[]> {

    return this.http.get<RoleResponseModel[]>(
      this.baseUrl
    );
  }


  // =========================================================
  // DELETE ROLE
  // DELETE /api/roles/{id}
  // =========================================================

  deleteRole(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}