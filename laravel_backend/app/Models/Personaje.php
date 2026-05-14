<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Personaje
 * 
 * Representa un Personaje con sus caracteristicas.
 */
class Personaje extends Model
{
    use HasFactory;

    /**
     * Campos que se pueden asignar masivamente.
     * 
     * @var array<string>
     */
    protected $fillable = [
        'nombre',           // Nombre del Personaje
        'tipo',             // Tipo de Personaje (heroe, aliado, etc.)
        'mundo',            // Mundo al que pertenece el personaje
        'nivel'             // Nivel del Personaje (entre 1 y 100)
    ];

    /**
     * Nombre de la tabla en la base de datos.
     * 
     * @var string
     */
    protected $table = 'personaje';

}