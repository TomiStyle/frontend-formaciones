import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers() {
    return this.http.get<{ users: any[] }>(`${this.apiUrl}users`);
  }

  deleteUser(dni: string) {
    return this.http.delete(`${this.apiUrl}users/${dni}`);
  }
}