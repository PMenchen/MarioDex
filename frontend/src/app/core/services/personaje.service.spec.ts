import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PersonajeService } from './personaje.service';
import { Personaje, CreatePersonajeDto } from '../models/personaje.model';
import { environment } from '../../../environments/environment';

/**
 * Suite de pruebas unitarias para PersonajeService
 * Verifica operaciones CRUD y manejo de errores
 */
describe('PersonajeService', () => {
    let service: PersonajeService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/personajes`;

    //Mock de datos de Personajes para las pruebas
    const mockPersonaje: Personaje = {
        id: 1,
        nombre: 'Mario',
        tipo: 'heroe',
        mundo: 'Reino Champiñon',
        nivel: 46
    }

    const mockPersonajeList: Personaje[] = [
        mockPersonaje,
        {
            id: 2,
            nombre: 'Luigi',
            tipo: 'heroe',
            mundo: 'Reino Champiñon',
            nivel: 82
        },
        {
            id: 3,
            nombre: 'Koopa',
            tipo: 'enemigo',
            mundo: 'Green Hills',
            nivel: 26
        }
    ];

    /**
     * Configuracion inicial antes de cada test
     * Configura el modulo de testing con HttpClientTestingModule
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PersonajeService]
        });

        service = TestBed.inject(PersonajeService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    /**
     * Verifica que no queden peticiones HTTP pendientes
     */
    afterEach(() => {
        httpMock.verify();
    });


    // ============================================
    // TEST 1: Correcta creacion del servicio
    // ============================================
    describe('Creacion del servicio', () => {
        it('deberia crear el servicio correctamente', () => {
            expect(service).toBeTruthy();
        });

        it('deberia inicializar con un array vacio de personajes', () => {
            let personajes: Personaje[] = [];
            service.personajes$.subscribe(p => personajes = p);
            expect(personajes).toEqual([]);
        });
    });

    

    // ============================================
    // TEST 2: Correcta obtencion de la lista de Pokemon
    // ============================================
    describe('getPersonajes', () => {
        it('deberia obtener la lista de Pokemon correctamente', () => {
            service.getPersonajes().subscribe(personajes => {
                expect(personajes.length).toBe(3);
                expect(personajes).toEqual(mockPersonajeList);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });
        });

        it('deberia actualizar el BehaviorSubject despues de obtener Personajes', () => {
            service.getPersonajes().subscribe();

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            service.personajes$.subscribe(personajes => {
                expect(personajes.length).toBe(3);
            });
        });

        it('deberia propagar el error si la API falla', () => {
            let errorThrown = false;
            
            service.getPersonajes().subscribe({
                next: () => {},
                error: () => {
                    errorThrown = true;
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.error(new ProgressEvent('Network error'));

            expect(errorThrown).toBeTrue();
        });
    });
    
    // ============================================
    // TEST 3: Anadir y eliminar Personaje
    // ============================================
    describe('agregarPersonaje', () => {
        it('deberia agregar un nuevo Personaje correctamente', () => {
            const nuevoPersonaje: CreatePersonajeDto = {
                nombre: 'Bowser',
                tipo: 'Enemigo',
                mundo: 'Mundo Lava',
                nivel: 73
            };

            const personajeCreado: Personaje = { id: 4, ...nuevoPersonaje };

            service.createPersonaje(nuevoPersonaje).subscribe(personaje => {
                expect(personaje).toEqual(personajeCreado);
                expect(personaje?.id).toBe(4);
                expect(personaje?.nombre).toBe('Bowser');
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(nuevoPersonaje);
            req.flush({ success: true, data: personajeCreado, message: 'Personaje creado' });
        });

        it('deberia actualizar la lista local despues de agregar un Personaje', () => {
            // Primero cargamos la lista inicial
            service.getPersonajes().subscribe();
            const reqGet = httpMock.expectOne(apiUrl);
            reqGet.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            // Luego agregamos un nuevo Personaje
            const nuevoPersonaje: CreatePersonajeDto = {
                nombre: 'Bowser',
                tipo: 'Enemigo',
                mundo: 'Mundo Lava',
                nivel: 73
            };

            const personajeCreado: Personaje = { id: 4, ...nuevoPersonaje };

            service.createPersonaje(nuevoPersonaje).subscribe();

            const reqPost = httpMock.expectOne(apiUrl);
            reqPost.flush({ success: true, data: personajeCreado, message: 'Personaje creado' });

            // Verificamos que la lista se actualizo
            service.personajes$.subscribe(personajes => {
                expect(personajes.length).toBe(4);
                expect(personajes[3].nombre).toBe('Bowser');
            });
        });

        it('deberia retornar null si falla al agregar Personaje', () => {
            const nuevoPersonaje: CreatePersonajeDto = {
                nombre: 'Test',
                tipo: 'Normal',
                mundo: 'Default',
                nivel: 1
            };

            service.createPersonaje(nuevoPersonaje).subscribe(result => {
                expect(result).toBeNull();
            });

            const req = httpMock.expectOne(apiUrl);
            req.error(new ProgressEvent('Server error'));
        });
    });

    describe('eliminarPersonaje', () => {
        it('deberia eliminar un Personaje correctamente', () => {
            // Primero cargamos la lista
            service.getPersonajes().subscribe();
            const reqGet = httpMock.expectOne(apiUrl);
            reqGet.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            // Eliminamos el Pokemon con id 1
            let deleteCompleted = false;
            service.deletePersonaje(1).subscribe({
                next: () => {
                    deleteCompleted = true;
                },
                complete: () => {
                    expect(deleteCompleted).toBeTrue();
                }
            });

            const reqDelete = httpMock.expectOne(`${apiUrl}/1`);
            expect(reqDelete.request.method).toBe('DELETE');
            reqDelete.flush({ success: true, data: null, message: 'Personaje eliminado' });
        });

        it('deberia actualizar la lista local despues de eliminar', () => {
            // Cargamos la lista inicial
            service.getPersonajes().subscribe();
            const reqGet = httpMock.expectOne(apiUrl);
            reqGet.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            // Eliminamos el Pokemon con id 1
            service.deletePersonaje(1).subscribe();

            const reqDelete = httpMock.expectOne(`${apiUrl}/1`);
            reqDelete.flush({ success: true, message: 'Personaje eliminado' });

            // Verificamos que se elimino de la lista local
            service.personajes$.subscribe(personajes => {
                expect(personajes.length).toBe(2);
                expect(personajes.find(p => p.id === 1)).toBeUndefined();
            });
        });

        it('deberia retornar false si falla al eliminar Personaje', () => {
            service.deletePersonaje(999).subscribe(success => {
                expect(success).toBe(false);
            });

            const req = httpMock.expectOne(`${apiUrl}/999`);
            req.error(new ProgressEvent('Not found'));
        });
    });

    // ============================================
    // TEST 4: Comportamiento ante datos incorrectos o vacios
    // ============================================
    describe('Manejo de datos incorrectos o vacios', () => {
        it('deberia manejar respuesta con lista vacia', () => {
            service.getPersonajes().subscribe(personajes => {
                expect(personajes).toEqual([]);
                expect(personajes.length).toBe(0);
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: [], message: 'Sin Personajes' });
        });

        it('deberia propagar error de red correctamente', () => {
            let errorReceived = false;
            
            service.getPersonajes().subscribe({
                next: () => {},
                error: () => {
                    errorReceived = true;
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.error(new ProgressEvent('Network error'), { status: 0 });

            expect(errorReceived).toBeTrue();
        });

        it('deberia propagar error 500 del servidor', () => {
            let errorReceived = false;
            
            service.getPersonajes().subscribe({
                next: () => {},
                error: () => {
                    errorReceived = true;
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

            expect(errorReceived).toBeTrue();
        });

        it('deberia propagar error 404 al obtener Personaje por ID', () => {
            let errorReceived = false;
            
            service.getPersonaje(999).subscribe({
                next: () => {},
                error: () => {
                    errorReceived = true;
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/999`);
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });

            expect(errorReceived).toBeTrue();
        });

        it('deberia manejar respuesta con data null retornando array vacio', () => {
            service.getPersonajes().subscribe(personajes => {
                // El servicio usa response.data || [] asi que null se convierte en []
                expect(personajes).toEqual([]);
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: null });
        });
    });
});
