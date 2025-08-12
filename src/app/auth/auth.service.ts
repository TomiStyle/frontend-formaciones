import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  // Cogemos la url de la API del archivo de entorno, que dependerá de la forma de arranque de la aplicación
  private apiUrl = environment.apiUrl;

  login(dni: string, password: string) {
    // console.log(this.apiUrl);
    return this.http
      .post<{ token: string; user: any }>(`${this.apiUrl}users/login`, {
        id: dni,
        password,
      })
      .pipe(
        tap((response) => {
          // Almacenamos el token del usuario y sus datos
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        })
      );
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  // Método para actualizar el usuario en LocalStorage
  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Eliminamos la información del usuario de localStorage para así obligar a loguearse de nuevo
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
