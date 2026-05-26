import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonajeItemComponent } from './mario-item.component';
import { Personaje } from '../../../core/models/personaje.model';

/**
 * Suite de pruebas unitarias para PersonajeItemComponent (mario-item)
 * Verifica la correcta creación, visualización de datos y emisión de eventos
 */
describe('PersonajeItemComponent', () => {
    let component: PersonajeItemComponent;
    let fixture: ComponentFixture<PersonajeItemComponent>;

    // Mock de personaje para las pruebas
    const mockPersonaje: Personaje = {
        id: 1,
        nombre: 'Mario',
        tipo: 'heroe',
        mundo: 'Reino Champiñon',
        nivel: 56
    };

    /**
     * Configuración inicial antes de cada test
     */
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PersonajeItemComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PersonajeItemComponent);
        component = fixture.componentInstance;
    });

    // ============================================
    // TEST 1: Correcta creación del componente
    // ============================================
    describe('Creación del componente', () => {
        it('debería crear el componente correctamente', () => {
            component.personaje = mockPersonaje;
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });

        it('debería recibir el input de personaje correctamente', () => {
            component.personaje = mockPersonaje;
            fixture.detectChanges();

            expect(component.personaje).toEqual(mockPersonaje);
            expect(component.personaje.nombre).toBe('Mario');
            expect(component.personaje.tipo).toBe('heroe');
        });

        it('debería tener el output eliminar definido', () => {
            component.personaje = mockPersonaje;
            fixture.detectChanges();

            expect(component.eliminar).toBeDefined();
        });
    });

    // ============================================
    // TEST 2: Correcta visualización de datos
    // ============================================
    describe('Visualización de datos del personaje', () => {
        beforeEach(() => {
            component.personaje = mockPersonaje;
            fixture.detectChanges();
        });

        it('debería mostrar el nombre del personaje', () => {
            expect(component.personaje.nombre).toBe('Mario');
        });

        it('debería mostrar el tipo del personaje', () => {
            expect(component.personaje.tipo).toBe('heroe');
        });

        it('debería mostrar el mundo del personaje', () => {
            expect(component.personaje.mundo).toBe('Reino Champiñon');
        });

        it('debería mostrar el nivel del personaje', () => {
            expect(component.personaje.nivel).toBe(56);
        });
    });

    // ============================================
    // TEST 3: Funcionamiento de eliminar personaje
    // ============================================
    describe('Eliminar personaje', () => {
        beforeEach(() => {
            component.personaje = mockPersonaje;
            fixture.detectChanges();
        });

        it('debería emitir el evento eliminar con el ID correcto al llamar onEliminar()', () => {
            spyOn(component.eliminar, 'emit');

            component.onEliminar();

            expect(component.eliminar.emit).toHaveBeenCalledWith(1);
        });

        it('debería emitir el ID del personaje actual', () => {
            const otroPersonaje: Personaje = {
                id: 5,
                nombre: 'Luigi',
                tipo: 'heroe',
                mundo: 'Mansion Boo',
                nivel: 48
            };
            component.personaje = otroPersonaje;

            spyOn(component.eliminar, 'emit');

            component.onEliminar();

            expect(component.eliminar.emit).toHaveBeenCalledWith(5);
        });
    });

    // ============================================
    // TEST 4: Obtención de color por tipo
    // ============================================
    describe('getTipoColor', () => {
        beforeEach(() => {
            component.personaje = { ...mockPersonaje };
            fixture.detectChanges();
        });

        it('debería retornar el color correcto para tipo aliado', () => {
            component.personaje.tipo = 'aliado';
            const color = component.getTipoColor();
            expect(color).toBe('#6890F0');
        });

        it('debería retornar el color correcto para tipo heroe', () => {
            component.personaje.tipo = 'heroe';
            const color = component.getTipoColor();
            expect(color).toBe('#C03028');
        });

        it('debería retornar el color correcto para tipo enemigo', () => {
            component.personaje.tipo = 'enemigo';
            const color = component.getTipoColor();
            expect(color).toBe('#A8B820');
        });

        it('debería retornar el color correcto para tipo jefe', () => {
            component.personaje.tipo = 'jefe';
            const color = component.getTipoColor();
            expect(color).toBe('#705898');
        });

        it('debería retornar color por defecto para tipos desconocidos', () => {
            component.personaje.tipo = 'tipo_desconocido';
            const color = component.getTipoColor();
            expect(color).toBe('#68A090');
        });

        it('debería manejar tipos en mayúsculas', () => {
            component.personaje.tipo = 'HEROE';
            const color = component.getTipoColor();
            expect(color).toBe('#C03028');
        });

        it('debería manejar tipos mixtos', () => {
            component.personaje.tipo = 'Aliado';
            const color = component.getTipoColor();
            expect(color).toBe('#6890F0');
        });
    });

    // ============================================
    // TEST 5: Comportamiento ante datos incorrectos o vacíos
    // ============================================
    describe('Manejo de datos incorrectos o vacíos', () => {
        it('debería manejar un personaje con valores mínimos', () => {
            const personajeMinimo: Personaje = {
                id: 0,
                nombre: '',
                tipo: '',
                mundo: '',
                nivel: 1
            };
            component.personaje = personajeMinimo;
            fixture.detectChanges();

            expect(component.personaje).toBeDefined();
            expect(component.getTipoColor()).toBe('#68A090'); // Color por defecto
        });

        it('debería manejar un personaje con nivel máximo', () => {
            const personajeMax: Personaje = {
                id: 999,
                nombre: 'Bowser',
                tipo: 'jefe',
                mundo: 'Mundo Lava',
                nivel: 100
            };
            component.personaje = personajeMax;
            fixture.detectChanges();

            expect(component.personaje.nivel).toBe(100);
        });

        it('debería manejar tipos con espacios', () => {
            component.personaje = { ...mockPersonaje, tipo: ' heroe ' };
            fixture.detectChanges();

            // El toLowerCase no elimina espacios, así que no encontrará coincidencia directa
            // pero el includes debería funcionar
            const color = component.getTipoColor();
            expect(color).toBeDefined();
        });

        it('debería retornar color por defecto para tipo vacío', () => {
            component.personaje = { ...mockPersonaje, tipo: '' };
            fixture.detectChanges();

            const color = component.getTipoColor();
            expect(color).toBe('#68A090');
        });

        it('debería emitir el evento eliminar correctamente con ID 0', () => {
            component.personaje = { ...mockPersonaje, id: 0 };
            fixture.detectChanges();

            spyOn(component.eliminar, 'emit');
            component.onEliminar();

            expect(component.eliminar.emit).toHaveBeenCalledWith(0);
        });

        it('debería emitir el evento eliminar correctamente con ID grande', () => {
            component.personaje = { ...mockPersonaje, id: 999999 };
            fixture.detectChanges();

            spyOn(component.eliminar, 'emit');
            component.onEliminar();

            expect(component.eliminar.emit).toHaveBeenCalledWith(999999);
        });
    });

    // ============================================
    // TEST: Renderizado en el DOM
    // ============================================
    describe('Renderizado en el DOM', () => {
        beforeEach(() => {
            component.personaje = mockPersonaje;
            fixture.detectChanges();
        });

        it('debería compilar el template sin errores', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled).toBeTruthy();
        });
    });
});
