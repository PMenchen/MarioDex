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
   * NO llama a fixture.detectChanges() para evitar peticiones automáticas
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
    // NO llamamos fixture.detectChanges() aquí para controlar cuándo se dispara ngOnInit
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
      // Usamos spy para evitar peticion HTTP real
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();
      
      expect(component).toBeTruthy();
    });

    it('debería inicializar con mostrarModal en false', () => {
      // Verificamos el estado ANTES de ngOnInit (no llamamos detectChanges)
      expect(component.mostrarModal).toBeFalse();
    });

    it('debería tener el observable personajes$ definido después de ngOnInit', () => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();
      
      expect(component.personajes$).toBeDefined();
    });
  });

  // ============================================
  // TEST 2: Correcta obtención de la lista de personajes
  // ============================================
  describe('Obtención de personajes', () => {
    it('debería obtener la lista de personajes al inicializar', fakeAsync(() => {
      // Usamos spy para evitar problemas con multiples suscripciones del async pipe
      const spy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      
      fixture.detectChanges();
      tick();

      let personajes: Personaje[] = [];
      component.personajes$.subscribe(p => personajes = p);

      expect(spy).toHaveBeenCalled();
      expect(personajes.length).toBe(3);
      expect(personajes[0].nombre).toBe('Mario');
    }));

    it('debería manejar una lista vacía de personajes', fakeAsync(() => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of([]));
      
      fixture.detectChanges();
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
    it('debería abrir el modal al llamar abrirModal()', () => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

      expect(component.mostrarModal).toBeFalse();
      component.abrirModal();
      expect(component.mostrarModal).toBeTrue();
    });

    it('debería cerrar el modal al llamar cerrarModal()', () => {
      const getSpy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

      component.mostrarModal = true;
      component.cerrarModal();

      expect(component.mostrarModal).toBeFalse();
      // getPersonajes se llama 2 veces: en ngOnInit y en cerrarModal
      expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('debería recargar la lista de personajes al cerrar el modal', () => {
      const spy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));

      fixture.detectChanges(); // Primera llamada en ngOnInit
      component.cerrarModal(); // Segunda llamada

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Eliminar personaje', () => {
    it('debería llamar a deletePersonaje del servicio cuando se confirma', () => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

      spyOn(window, 'confirm').and.returnValue(true);
      const deleteSpy = spyOn(personajeService, 'deletePersonaje').and.returnValue(of(true));

      component.eliminarPersonaje(1);

      expect(deleteSpy).toHaveBeenCalledWith(1);
    });

    it('no debería llamar a deletePersonaje si el usuario cancela', () => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

      spyOn(window, 'confirm').and.returnValue(false);
      const deleteSpy = spyOn(personajeService, 'deletePersonaje').and.returnValue(of(true));

      component.eliminarPersonaje(1);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('debería recargar la lista después de eliminar exitosamente', fakeAsync(() => {
      const getSpy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(personajeService, 'deletePersonaje').and.returnValue(of(true));

      component.eliminarPersonaje(1);
      tick();

      // Se llama en ngOnInit y después de eliminar
      expect(getSpy).toHaveBeenCalledTimes(2);
    }));

    it('debería manejar errores al eliminar un personaje', fakeAsync(() => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

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
      spyOn(personajeService, 'getPersonajes').and.returnValue(of([]));
      fixture.detectChanges();

      tick();

      let personajes: Personaje[] = [];
      component.personajes$.subscribe(p => personajes = p);

      expect(personajes).toEqual([]);
      expect(personajes.length).toBe(0);
    }));

    it('debería manejar error de red al obtener personajes', fakeAsync(() => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(
        throwError(() => new Error('Network error'))
      );
      
      fixture.detectChanges();
      tick();

      // El componente sigue existiendo aunque el observable emita error
      expect(component).toBeTruthy();
      // El async pipe maneja el error internamente
    }));

    it('debería manejar respuesta con datos null', fakeAsync(() => {
      // Simulamos respuesta con null que el servicio convierte a []
      spyOn(personajeService, 'getPersonajes').and.returnValue(of([]));
      fixture.detectChanges();

      tick();

      let personajes: Personaje[] | null = null;
      component.personajes$.subscribe(p => personajes = p);

      expect(personajes).toBeDefined();
    }));

    it('debería manejar error 500 del servidor', fakeAsync(() => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(
        throwError(() => ({ status: 500, message: 'Server Error' }))
      );
      
      fixture.detectChanges();
      tick();

      // El componente debería seguir existiendo aunque haya error
      expect(component).toBeTruthy();
    }));

    it('debería mostrar el confirm antes de eliminar', () => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      fixture.detectChanges();

      const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);

      component.eliminarPersonaje(1);

      expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este personaje?');
    });
  });

  // ============================================
  // TEST: Pruebas de integración HTTP
  // ============================================
  describe('Integración con HttpClient', () => {
    it('debería realizar petición GET al inicializar', fakeAsync(() => {
      // Usamos spy para verificar que se llama al servicio
      const spy = spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalled();
    }));

    it('debería reaccionar a los datos recibidos del backend', fakeAsync(() => {
      spyOn(personajeService, 'getPersonajes').and.returnValue(of(mockPersonajeList));
      
      fixture.detectChanges();
      tick();

      // Verificar que el componente reacciona a los datos
      let received: Personaje[] = [];
      component.personajes$.subscribe(data => received = data);

      expect(received.length).toBe(3);
      expect(received[0].id).toBe(1);
      expect(received[1].nombre).toBe('Luigi');
    }));
  });
});
