import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonajeService } from '../../../core/services/personaje.service';
import { Personaje } from '../../../core/models/personaje.model';
import { Observable } from 'rxjs';
import { PersonajeItemComponent } from '../mario-item/mario-item.component';
import { NuevoPersonajeComponent } from '../nuevo-personaje/nuevo-personaje.component';

/**
 * Componente principal de la Pokédex
 * Muestra la lista completa de Pokémon y gestiona el modal de creación
 */
@Component({
  selector: 'app-mario-page',
  standalone: true,
  imports: [CommonModule, PersonajeItemComponent, NuevoPersonajeComponent],
  templateUrl: './mario-page.component.html',
  styleUrls: ['./mario-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MarioPageComponent implements OnInit {
  /** Observable que contiene la lista de Pokémon */
  personajes$!: Observable<Personaje[]>;

  /** Controla la visibilidad del modal de nuevo Pokémon */
  mostrarModal = false;

  constructor(private personajeService: PersonajeService) {}

  /**
   * Inicializa el componente obteniendo la lista de Pokémon
   */
  ngOnInit(): void {
    this.personajes$ = this.personajeService.getPersonajes();
  }

  /**
   * Abre el modal para agregar un nuevo Pokémon
   */
  abrirModal(): void {
    this.mostrarModal = true;
  }

  /**
   * Cierra el modal de nuevo Pokémon
   */
  cerrarModal(): void {
    this.mostrarModal = false;
  }

  /**
   * Elimina un Pokémon después de confirmar la acción
   * @param id - ID del Pokémon a eliminar
   */
  eliminarPersonaje(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este personaje?')) {
      this.personajeService.deletePersonaje(id);
    }
  }
}
