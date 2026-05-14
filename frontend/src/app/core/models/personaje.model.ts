/**
 * Interfaz que define la estructura de un Personaje
 * @interface Personaje
 */
export interface Personaje {
  /** Identificador único del Personaje */
  id: number;

  /** Nombre del Personaje */
  nombre: string;

  /** Tipo elemental del Personaje  */
  tipo: string;

  /** Tipo elemental del Personaje  */
  mundo: string;

  /** Nivel actual del Personaje (1-100) */
  nivel: number;

}