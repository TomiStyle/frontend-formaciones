import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(dni: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}users/login`, { id: dni, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}