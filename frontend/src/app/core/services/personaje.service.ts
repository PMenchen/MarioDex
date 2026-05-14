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
import { BehaviorSubject, Observable, throwError, tap, map, catchError, of } from 'rxjs';
import { CreatePersonajeDto, Personaje, UpdatePersonajeDto } from '../models/personaje.model';
import { ApiResponse } from '../models/api-response.model';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PersonajeService {
    private apiUrl = environment.apiUrl;

    /** BehaviorSubject que mantiene el estado local de los Personajes */
    private personajesSubject = new BehaviorSubject<Personaje[]>([]);

    /** Observable publico para que los componentes se suscriban a cambios */
    public personajes$ = this.personajesSubject.asObservable();

    /** Flag para saber si ya se han cargado los datos */
    private loaded = false;

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
                tap(personajes => {
                    this.personajesSubject.next(personajes);
                    this.loaded = true;
                }),
                catchError(this.handleError('getPersonajes'))
            );
    } 

    /**
     * Carga los Personajes solo si no se han cargado previamente
     * Util para la carga inicial
     */
    loadPersonajes(): void {
        if (!this.loaded) {
        this.getPersonajes().subscribe();
        }
    }

    getPersonaje(id: number): Observable<Personaje> {
        return this.http.get<ApiResponse<Personaje>>(`${this.apiUrl}/personajes/${id}`, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            catchError(this.handleError('getPersonaje'))
        );
    }

    createPersonaje(personaje: CreatePersonajeDto): Observable<Personaje | null> {
        return this.http.post<ApiResponse<Personaje>>(`${this.apiUrl}/personajes`, personaje, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            tap(newPersonaje => {
                const currentPersonajes = this.personajesSubject.getValue();
                this.personajesSubject.next([...currentPersonajes, newPersonaje]);
            }),
            catchError(error => {
                console.error('Error al crear Personaje:', error);
                return of(null);
            })
        );
    }

    updatePersonaje(id: number, personaje: UpdatePersonajeDto): Observable<Personaje> {
        return this.http.put<ApiResponse<Personaje>>(`${this.apiUrl}/personajes/${id}`, personaje, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            tap(updatedPersonaje => {
                const currentPersonajes = this.personajesSubject.getValue();
                const index = currentPersonajes.findIndex(p => p.id === id);
                if (index !== -1) {
                currentPersonajes[index] = updatedPersonaje;
                this.personajesSubject.next([...currentPersonajes]);
                }
            }),
            catchError(this.handleError('updatePersonaje'))
        );
    }

    deletePersonaje(id: number): Observable<any> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/personajes/${id}`, { headers: this.getHeaders() })
        .pipe(
            map(response => response.data),
            tap(() => {
                const currentPersonajes = this.personajesSubject.getValue();
                this.personajesSubject.next(currentPersonajes.filter(p => p.id !== id));
            }),
            catchError(error => {
                console.error(`Error al eliminar Personaje ${id}:`, error);
                return of(false);
            })
        );
    }

    /**
     * Fuerza la recarga de los datos desde la API
     */
    refresh(): void {
        this.loaded = false;
        this.getPersonajes().subscribe();
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