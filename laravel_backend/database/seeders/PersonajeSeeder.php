<?php

namespace Database\Seeders;

use App\Models\Personaje;
use Illuminate\Database\Seeder;

class PersonajeSeeder extends Seeder
{
    /**
     * Poblar la tabla de personajes
     */
    public function run(): void
    {

        $personajes = [
            ['nombre' => 'Mario', 'tipo' => 'Heroe', 'mundo' => 'Reino Champiñón', 'nivel'=>92],
            ['nombre' => 'Luigi', 'tipo' => 'Heroe', 'mundo' => 'Reino Champiñón', 'nivel'=>87],
            ['nombre' => 'Yoshi', 'tipo' => 'Aliado', 'mundo' => 'Mundo 1', 'nivel'=>80],
            ['nombre' => 'Toad', 'tipo' => 'Aliado', 'mundo' => 'Reino Champiñón', 'nivel'=>69],
            ['nombre' => 'Bowser', 'tipo' => 'Jefe', 'mundo' => 'Castillo Bowser', 'nivel'=>90],
            ['nombre' => 'Koopa Troopa', 'tipo' => 'Enemigo', 'mundo' => 'Mundo Inferior', 'nivel'=>40],
            ['nombre' => 'Goomba', 'tipo' => 'Enemigo', 'mundo' => 'Mundo GreenHills', 'nivel'=>28]
        ];

        foreach ($personajes as $personaje) {
            Personaje::create([
                'nombre' => $personaje['nombre'],
                'tipo' => $personaje['tipo'],
                'mundo' => $personaje['mundo'],
                'nivel' => $personaje['nivel'],
            ]);
        }

    }
}

?>
