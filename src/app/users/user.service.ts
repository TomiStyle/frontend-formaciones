import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Enviamos en la cabecera el token del usuario para que lo reciba la API, si no, la API no devolverá la información
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Llamadas a la API
  getUsers() {
    return this.http.get<{ users: any[] }>(`${this.apiUrl}users`, this.getAuthHeaders());
  }

  createUser(user: any) {
    return this.http.post(`${this.apiUrl}users/register`, user, this.getAuthHeaders());
  }

  deleteUser(dni: string) {
    return this.http.delete(`${this.apiUrl}users/${dni}`, this.getAuthHeaders());
  }

  getUser(dni: string) {
    return this.http.get<{ user: any }>(`${this.apiUrl}users/${dni}`, this.getAuthHeaders());
  }

  updateUser(dni: string, data: any) {
    return this.http.put(`${this.apiUrl}users/${dni}`, data, this.getAuthHeaders());
  }

  getProfile() {
    return this.http.get<{ user: any }>(`${this.apiUrl}users/profile`, this.getAuthHeaders());
  }

  updateProfile(data: any) {
    return this.http.put(`${this.apiUrl}users/updateProfile`, data, this.getAuthHeaders());
  }
}