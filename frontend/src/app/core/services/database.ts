import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Personaje } from '../models/personaje.model';
import {environment} from '../../../environments/environment';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable({
    providedIn: 'root',
})
export class Database {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    // ============ PERSONAJES ==========

    getPersonajes(): Observable<Personaje[]> {
        return this.http.get<ApiResponse<Personaje[]>>(`${this.apiUrl}/personajes`, {headers: this.getHeaders() })
            .pipe(
                map(response => response.data || []),
                catchError(this.handleError('getPersonajes'))
            );
    } 

    getPersonaje(id: number): Observable<Personaje> {
        return this.http.get<ApiResponse<Personaje>>(`${this.apiUrl}/personajes/${id}`, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            catchError(this.handleError('getPersonaje'))
        );
    }

    createPersonaje(personaje: Personaje): Observable<Personaje> {
        return this.http.post<ApiResponse<Personaje>>(`${this.apiUrl}/personajes`, personaje, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            catchError(this.handleError('createPersonaje'))
        );
    }

    updatePersonaje(id: number, personaje: Partial<Personaje>): Observable<Personaje> {
        return this.http.put<ApiResponse<Personaje>>(`${this.apiUrl}/personajes/${id}`, personaje, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            catchError(this.handleError('updatePersonaje'))
        );
    }

    deletePersonaje(id: number): Observable<any> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/personajes/${id}`, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            catchError(this.handleError('deletePersonaje'))
        );
    }


    //================  MANEJO DE ERRORES ================
    
  /**
   * Maneja errores de las peticiones HTTP propagandolos al componente.
   * Esto permite que cada componente decida como manejar el error
   * (mostrar mensaje, redirigir, reintentar, etc.)
   */
  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} fallo:`, error.message);

      // Puedes agregar logica adicional aqui:
      // - Enviar errores a un servicio de logging
      // - Mostrar notificaciones globales
      // - Manejar errores de autenticacion (401/403)

      if (error.status === 401) {
        // Token expirado o no autorizado
        localStorage.removeItem('token');
        // Podrias redirigir al login aqui si inyectas Router
      }

      // Propaga el error para que el componente lo maneje
      return throwError(() => error);
    };
  }
}