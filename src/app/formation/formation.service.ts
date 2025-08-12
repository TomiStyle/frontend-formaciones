// src/app/formation/formation.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FormationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        // Importante no fijar "Content-Type" manualmente en multipart/form-data
      }),
    };
  }

  // Crear formación (subida Excel)
  createFormation(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}formations`,
      formData,
      this.getAuthHeaders()
    );
  }

  // Listar formaciones
  listFormations(): Observable<{ formations: any[] }> {
    return this.http.get<{ formations: any[] }>(
      `${this.apiUrl}formations`,
      this.getAuthHeaders()
    );
  }
}
