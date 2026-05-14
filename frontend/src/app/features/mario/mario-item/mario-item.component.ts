import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Personaje } from '../../../core/models/personaje.model';

/**
 * Componente que representa una tarjeta individual de Pokémon
 * Muestra la información y permite eliminarlo
 */
@Component({
  selector: 'app-personaje-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mario-item.component.html',
  styleUrls: ['./mario-item.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PersonajeItemComponent {
  /** Datos del Pokémon a mostrar */
  @Input() personaje!: Personaje;

  /** Evento emitido cuando se elimina el Pokémon */
  @Output() eliminar = new EventEmitter<number>();

  /**
   * Emite el evento de eliminación con el ID del Pokémon
   */
  onEliminar(): void {
    this.eliminar.emit(this.personaje.id);
  }

  /**
   * Obtiene el color asociado al tipo de Pokémon
   * @returns Código hexadecimal del color
   */
  getTipoColor(): string {
    const tipoLower = this.personaje.tipo.toLowerCase();

    // Mapa de colores oficiales de Pokémon por tipo
    const colorMap: { [key: string]: string } = {
      'aliado': '#6890F0',
      'heroe': '#C03028',
      'enemigo': '#A8B820',
      'jefe': '#705898'
    };

    // Busca el tipo en el mapa (soporta variantes con y sin acentos)
    for (const [tipo, color] of Object.entries(colorMap)) {
      if (tipoLower.includes(tipo)) {
        return color;
      }
    }
    // Color por defecto si no se encuentra el tipo
    return '#68A090';
  }
}
