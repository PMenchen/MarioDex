import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarioPageComponent } from './mario-page.component';
import { PersonajeService } from '../../../core/services/personaje.service';
import { Personaje } from '../../../core/models/personaje.model';
import { environment } from '../../../../environments/environment';
import { of, throwError } from 'rxjs';

/**
 * Suite de pruebas unitarias para MarioPageComponent
 * Verifica la correcta creación, obtención de personajes, eliminación y manejo de errores
 */
describe('MarioPageComponent', () => {
    let component: MarioPageComponent;
    let fixture: ComponentFixture<MarioPageComponent>;
    let httpMock: HttpTestingController;
    let personajeService: PersonajeService;
    const apiUrl = `${environment.apiUrl}/personajes`;

    // Mock de datos de Personajes para las pruebas
    const mockPersonajeList: Personaje[] = [
        {
            id: 1,
            nombre: 'Mario',
            tipo: 'heroe',
            mundo: 'Reino Champiñon',
            nivel: 46
        },
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
     * Configuración inicial antes de cada test
     * Configura el módulo de testing con HttpClientTestingModule
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MarioPageComponent],
            providers: [PersonajeService]
        }).compileComponents();

        fixture = TestBed.createComponent(MarioPageComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        personajeService = TestBed.inject(PersonajeService);
    });

    /**
     * Verifica que no queden peticiones HTTP pendientes
     */
    afterEach(() => {
        httpMock.verify();
    });

    // ============================================
    // TEST 1: Correcta creación del componente
    // ============================================
    describe('Creación del componente', () => {
        it('debería crear el componente correctamente', () => {
            // Necesitamos manejar la petición HTTP que se hace en ngOnInit
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            expect(component).toBeTruthy();
        });

        it('debería inicializar con mostrarModal en false', () => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: [], message: 'OK' });

            expect(component.mostrarModal).toBeFalse();
        });

        it('debería tener el observable personajes$ definido después de ngOnInit', () => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            expect(component.personajes$).toBeDefined();
        });
    });

    // ============================================
    // TEST 2: Correcta obtención de la lista de personajes
    // ============================================
    describe('Obtención de personajes', () => {
        it('debería obtener la lista de personajes al inicializar', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            tick();

            let personajes: Personaje[] = [];
            component.personajes$.subscribe(p => personajes = p);

            expect(personajes.length).toBe(3);
            expect(personajes[0].nombre).toBe('Mario');
        }));

        it('debería manejar una lista vacía de personajes', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: [], message: 'Sin personajes' });

            tick();

            let personajes: Personaje[] = [];
            component.personajes$.subscribe(p => personajes = p);

            expect(personajes.length).toBe(0);
        }));

        it('debería llamar al servicio getPersonajes en ngOnInit', () => {
            const spy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));

            fixture.detectChanges();

            expect(spy).toHaveBeenCalled();
        });
    });

    // ============================================
    // TEST 3: Funcionamiento de añadir y eliminar personaje
    // ============================================
    describe('Gestión del modal (añadir personaje)', () => {
        beforeEach(() => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });
        });

        it('debería abrir el modal al llamar abrirModal()', () => {
            expect(component.mostrarModal).toBeFalse();

            component.abrirModal();

            expect(component.mostrarModal).toBeTrue();
        });

        it('debería cerrar el modal al llamar cerrarModal()', () => {
            component.mostrarModal = true;

            component.cerrarModal();

            // Se hace una nueva petición al cerrar el modal
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            expect(component.mostrarModal).toBeFalse();
        });

        it('debería recargar la lista de personajes al cerrar el modal', () => {
            const spy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));

            component.cerrarModal();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Eliminar personaje', () => {
        beforeEach(() => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });
        });

        it('debería llamar a deletePersonaje del servicio cuando se confirma', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            const deleteSpy = spyOn(personajeService, 'deletePersonaje').and.returnValue(of(true));

            component.eliminarPersonaje(1);

            expect(deleteSpy).toHaveBeenCalledWith(1);
        });

        it('no debería llamar a deletePersonaje si el usuario cancela', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            const deleteSpy = spyOn(personajeService, 'deletePersonaje').and.returnValue(of(true));

            component.eliminarPersonaje(1);

            expect(deleteSpy).not.toHaveBeenCalled();
        });

        it('debería recargar la lista después de eliminar exitosamente', fakeAsync(() => {
            spyOn(window, 'confirm').and.returnValue(true);
            spyOn(personajeService, 'deletePersonaje').and.returnValue(of(true));
            const getSpy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList.slice(1)));

            component.eliminarPersonaje(1);
            tick();

            expect(getSpy).toHaveBeenCalled();
        }));

        it('debería manejar errores al eliminar un personaje', fakeAsync(() => {
            spyOn(window, 'confirm').and.returnValue(true);
            spyOn(personajeService, 'deletePersonaje').and.returnValue(throwError(() => new Error('Error de servidor')));
            const consoleSpy = spyOn(console, 'error');

            component.eliminarPersonaje(999);
            tick();

            expect(consoleSpy).toHaveBeenCalled();
        }));
    });

    // ============================================
    // TEST 4: Comportamiento ante datos incorrectos o vacíos
    // ============================================
    describe('Manejo de datos incorrectos o vacíos', () => {
        it('debería manejar respuesta con lista vacía', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: [], message: 'Sin personajes' });

            tick();

            let personajes: Personaje[] = [];
            component.personajes$.subscribe(p => personajes = p);

            expect(personajes).toEqual([]);
            expect(personajes.length).toBe(0);
        }));

        it('debería manejar error de red al obtener personajes', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            req.error(new ErrorEvent('Network error'));

            tick();

            let personajes: Personaje[] = [];
            component.personajes$.subscribe({
                next: p => personajes = p,
                error: () => personajes = []
            });

            expect(personajes).toEqual([]);
        }));

        it('debería manejar respuesta con datos null', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: null, message: 'OK' });

            tick();

            let personajes: Personaje[] = [];
            component.personajes$.subscribe(p => personajes = p);

            expect(personajes).toBeDefined();
        }));

        it('debería manejar error 500 del servidor', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

            tick();

            // El componente debería seguir funcionando aunque haya error
            expect(component).toBeTruthy();
        }));

        it('debería mostrar el confirm antes de eliminar', () => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);

            component.eliminarPersonaje(1);

            expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este personaje?');
        });
    });

    // ============================================
    // TEST: Pruebas de integración HTTP
    // ============================================
    describe('Integración con HttpClient', () => {
        it('debería incluir headers de autorización en las peticiones', fakeAsync(() => {
            // Simular token en localStorage
            spyOn(localStorage, 'getItem').and.returnValue('test-token');

            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.headers.has('Authorization')).toBeTrue();
            expect(req.request.headers.get('Content-Type')).toBe('application/json');
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });
        }));

        it('debería reaccionar a los datos recibidos del backend', fakeAsync(() => {
            fixture.detectChanges();

            const req = httpMock.expectOne(apiUrl);
            req.flush({ success: true, data: mockPersonajeList, message: 'OK' });

            tick();
            fixture.detectChanges();

            // Verificar que el componente reacciona a los datos
            let received: Personaje[] = [];
            component.personajes$.subscribe(data => received = data);

            expect(received.length).toBe(3);
            expect(received[0].id).toBe(1);
            expect(received[1].nombre).toBe('Luigi');
        }));
    });
});
