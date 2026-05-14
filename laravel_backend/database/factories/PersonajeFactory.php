<?php

namespace Database\Factories;

use App\Models\Personaje;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory para generar datos de prueba de Personaje
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Personaje>
 */
class PersonajeFactory extends Factory
{
    /**
     * El nombre del modelo correspondiente a la factory.
     *
     * @var string
     */
    protected $model = Personaje::class;

    /**
     * Define el estado por defecto del modelo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipos = ['Heroe', 'Aliado', 'Enemigo', 'Jefe'];
        $mundos = [
            'Green Hills', 'Bosque', 'Cueva', 'Mundo Lava', 
            'Nubes', 'Aliado'
        ];

        return [
            'nombre' => $this->faker->unique()->randomElement([
                'Mario', 'Peach', 'Luigi', 'Yoshi', 'Koopa',
                'Bowser', 'Fantasma', 'Gomba', 'Boo', 'Pez',
                'Toad', 'Waluigi', 'Wario'
            ]),
            'tipo' => $this->faker->randomElement($tipos),
            'mundo' => $this->faker->randomElement($mundos),
            'nivel' => $this->faker->numberBetween(1, 100),
        ];
    }


    /**
     * Indica que el Personaje es de tipo Heroe.
     */
    public function tipoHeroe(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo' => 'Heroe',
            'mundo' => 'Reino Champiñon',
        ]);
    }

    /**
     * Indica que el Personaje es de tipo Aliado.
     */
    public function tipoAliado(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo' => 'Aliado',
            'mundo' => 'Green Hills',
        ]);
    }

    /**
     * Indica que el Personaje tiene nivel maximo.
     */
    public function nivelMaximo(): static
    {
        return $this->state(fn (array $attributes) => [
            'nivel' => 100,
        ]);
    }
}
