// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Personaje } from '../models/personaje.model';

// /**
//  * Servicio para gestionar la colección de personajes
//  * Proporciona operaciones CRUD y gestión de estado reactivo
//  */
// @Injectable({
//   providedIn: 'root'
// })
// export class MarioService {
//   /** Array privado que almacena todos los personajes */
//   private personajes: Personaje[] = [
//     {
//       id: 1,
//       nombre: 'Mario',
//       tipo: 'Heroe',
//       mundo: 'Reino Champiñon',
//       nivel: 56
//     },
//     {
//       id: 2,
//       nombre: 'Luigi',
//       tipo: 'Heroe',
//       mundo: 'Mansion Boo',
//       nivel: 48
//     },
//     {
//       id: 3,
//       nombre: 'Peach',
//       tipo: 'Aliada',
//       mundo: 'Reino Champiñon',
//       nivel: 30
//     },
//     {
//       id: 4,
//       nombre: 'Bowser',
//       tipo: 'Jefe',
//       mundo: 'Mundo Lava',
//       nivel: 60
//     }
//   ];

//   /** BehaviorSubject que emite cambios en la colección de personajes */
//   private personajesSubject = new BehaviorSubject<Personaje[]>(this.personajes);

//   /** Observable público para que los componentes se suscriban a cambios */
//   public personajes$ = this.personajesSubject.asObservable();

//   constructor() {}

//   /**
//    * Obtiene el Observable de la colección de personajes
//    * @returns Observable con el array de personajes
//    */
//   getPersonajes(): Observable<Personaje[]> {
//     return this.personajes$;
//   }

//   /**
//    * Agrega un nuevo Personaje a la colección
//    * Genera automáticamente un ID único
//    * @param personaje - Datos del Personaje sin ID
//    */
//   agregarPersonaje(personaje: Omit<Personaje, 'id'>): void {
//     // Calcula el siguiente ID disponible
//     const nuevoId = this.personajes.length > 0
//       ? Math.max(...this.personajes.map(p => p.id)) + 1
//       : 1;

//     // Crea el nuevo Personaje con ID asignado
//     const nuevoPersonaje: Personaje = {
//       ...personaje,
//       id: nuevoId
//     };

//     // Actualiza el array y notifica a los suscriptores
//     this.personajes = [...this.personajes, nuevoPersonaje];
//     this.personajesSubject.next(this.personajes);
//   }

//   /**
//    * Elimina un Personaje de la colección por su ID
//    * @param id - ID del Personaje a eliminar
//    */
//   eliminarPersonaje(id: number): void {
//     this.personajes = this.personajes.filter(p => p.id !== id);
//     this.personajesSubject.next(this.personajes);
//   }

//   /**
//    * Busca un Personaje específico por su ID
//    * @param id - ID del Personaje a buscar
//    * @returns El Personaje encontrado o undefined
//    */
//   getPersonajePorId(id: number): Personaje | undefined {
//     return this.personajes.find(p => p.id === id);
//   }
// }
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
export class PersonajeService {
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