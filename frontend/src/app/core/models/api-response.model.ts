/**
 * Interfaz generica para las respuestas de la API Laravel
 * La API siempre devuelve este formato estandarizado
 * @interface ApiResponse
 */
export interface ApiResponse<T> {
  /** Indica si la operacion fue exitosa */
  success: boolean;

  /** Datos devueltos por la API */
  data: T;

  /** Mensaje descriptivo de la operacion */
  message: string;
}
