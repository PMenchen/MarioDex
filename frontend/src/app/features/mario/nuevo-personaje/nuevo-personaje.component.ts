import { Component, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonajeService } from '../../../core/services/personaje.service';

/**
 * Componente modal para crear un nuevo Pokémon
 * Gestiona el formulario de creación con validaciones
 */
@Component({
  selector: 'app-nuevo-personaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-personaje.component.html',
  styleUrls: ['./nuevo-personaje.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NuevoPersonajeComponent implements OnInit {
  /** Evento emitido cuando se cierra el modal */
  @Output() cerrar = new EventEmitter<void>();

  /** Formulario reactivo para el nuevo Pokémon */
  personajeForm!: FormGroup;

  /** Indica si el formulario ha sido enviado para mostrar validaciones */
  enviado = false;

  /** Lista de tipos de Pokémon disponibles */
  tipos = [
    'Heroe',
    'Aliado',
    'Enemigo',
    'Jefe'
  ];

  constructor(
    private fb: FormBuilder,
    private personajeService: PersonajeService
  ) {}

  /**
   * Inicializa el formulario con validaciones
   */
  ngOnInit(): void {
    this.personajeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', Validators.required],
      mundo: ['', [Validators.required, Validators.minLength(3)]],
      nivel: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario
   */
  get f() {
    return this.personajeForm.controls;
  }

  /**
   * Maneja el envío del formulario
   * Valida los datos y crea el nuevo Pokémon
   */
  onSubmit(): void {
    this.enviado = true;

    // Verifica que el formulario sea válido
    if (this.personajeForm.invalid) {
      return;
    }

    // Agrega el Pokémon al servicio
    this.personajeService.createPersonaje(this.personajeForm.value).subscribe({
      next: (personaje) => {
        console.log('Personaje creado: ', personaje);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al crear personaje:', error);
      }
    });
  }

  /**
   * Cierra el modal y emite el evento
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }

  /**
   * Cierra el modal al hacer clic en el fondo (backdrop)
   * @param event - Evento del mouse
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }
}
