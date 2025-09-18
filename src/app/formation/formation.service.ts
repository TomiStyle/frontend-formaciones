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
      }),
    };
  }

  // Creamos la formación (subida desde Excel)
  createFormation(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}formations`,
      formData,
      this.getAuthHeaders()
    );
  }

  // Listamos formaciones (el backend ya devuelve solo activas)
  listFormations(): Observable<{ formations: any[] }> {
    return this.http.get<{ formations: any[] }>(
      `${this.apiUrl}formations`,
      this.getAuthHeaders()
    );
  }

  // Borrado lógico de formación
  deleteFormation(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}formations/${id}`,
      this.getAuthHeaders()
    );
  }

  // Obtenemos formación con las personas ordenadas por FILA y después COLUMNA
  getFormationWithPeopleByRow(id: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}formations/${id}/people-by-row`,
      this.getAuthHeaders()
    );
  }

  // Obtenemos formación con las personas ordenadas por COLUMNA y después FILA
  getFormationWithPeopleByColumn(id: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}formations/${id}/people-by-column`,
      this.getAuthHeaders()
    );
  }

  // Intercambiamos posiciones entre dos personas
  swapPositions(
    formationId: string,
    body: { person1_id: string; person2_id: string }
  ): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    // Enviamos la petición a la API, pasándole en la URL la formación, y en el cuerpo los IDs en JSON de las personas a intercambiar
    return this.http.put(
      `${this.apiUrl}formations/${formationId}/swap-positions`,
      body,
      {
        headers,
      }
    );
  }

  // Sacamos una persona de la formación
  removePerson(formationId: string, personId: string) {
    // Pasamos la formación y la ID de la persona por URL
    const url = `${this.apiUrl}formations/${formationId}/remove-person/${personId}`;
    return this.http.put(url, {});
  }

  // Reinsertar una persona en la formación
  reinsertPerson(formationId: string, personId: string) {
    const url = `${this.apiUrl}formations/${formationId}/reinsert-person/${personId}`;
    return this.http.put(url, {});
  }
}
