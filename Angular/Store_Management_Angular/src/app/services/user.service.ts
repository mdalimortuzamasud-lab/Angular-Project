import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  UserRequestModel,
  UserResponseModel
} from '../model/user.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl + 'users';


  // =========================================================
  // CREATE USER
  // =========================================================

  createUser(
    user: UserRequestModel
  ): Observable<UserResponseModel> {

    return this.http.post<UserResponseModel>(
      this.apiUrl,
      user
    );
  }


  // =========================================================
  // GET ALL USERS
  // =========================================================

  getAllUsers(): Observable<UserResponseModel[]> {

    return this.http.get<UserResponseModel[]>(
      this.apiUrl
    );
  }


  // =========================================================
  // GET USER BY ID
  // =========================================================

  getUserById(
    id: number
  ): Observable<UserResponseModel> {

    return this.http.get<UserResponseModel>(
      `${this.apiUrl}/${id}`
    );
  }


  // =========================================================
  // UPDATE USER
  // =========================================================

  updateUser(
    id: number,
    user: UserRequestModel
  ): Observable<UserResponseModel> {

    return this.http.put<UserResponseModel>(
      `${this.apiUrl}/${id}`,
      user
    );
  }


  // =========================================================
  // DELETE USER
  // =========================================================

  deleteUser(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}