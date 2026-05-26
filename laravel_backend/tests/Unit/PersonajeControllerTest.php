<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Personaje;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Pruebas unitarias para personajeController
 * 
 * Verifica el correcto funcionamiento del controlador de personaje
 * incluyendo operaciones CRUD y validacion de datos.
 */
class PersonajeControllerTest extends TestCase
{
    use RefreshDatabase;

    // ============================================
    // TEST 1: Creacion de un Personaje
    // ============================================

    /**
     * Test: Deberia crear un Personaje correctamente con datos validos
     */
    public function test_puede_crear_un_personaje_con_datos_validos(): void
    {
        $personajeData = [
            'nombre' => 'Mario',
            'tipo' => 'heroe',
            'mundo' => 'Reino Champiñon',
            'nivel' => 25,
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Personaje creado correctamente'
            ])
            ->assertJsonPath('data.nombre', 'Mario')
            ->assertJsonPath('data.tipo', 'heroe')
            ->assertJsonPath('data.mundo', 'Reino Champiñon')
            ->assertJsonPath('data.nivel', 25);

        $this->assertDatabaseHas('personaje', [
            'nombre' => 'Mario',
            'tipo' => 'heroe',
            'mundo' => 'Reino Champiñon',
            'nivel' => 25,
        ]);
    }

    // ============================================
    // TEST 2: Actualizacion de datos
    // ============================================

    /**
     * Test: Deberia actualizar un personaje existente
     */
    public function test_puede_actualizar_un_personaje(): void
    {
        $personaje = personaje::factory()->create([
            'nombre' => 'Luigi',
            'tipo' => 'Heroe',
            'nivel' => 25,
        ]);

        $updateData = [
            'mundo' => 'Bosque',
            'nivel' => 50,
        ];

        $response = $this->putJson("/api/personajes/{$personaje->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Personaje actualizado correctamente'
            ])
            ->assertJsonPath('data.nivel', 50)
            ->assertJsonPath('data.mundo', 'Bosque');

        $this->assertDatabaseHas('personaje', [
            'id' => $personaje->id,
            'tipo' => 'Heroe',
            'mundo' => 'Bosque',
            'nivel' => 50,
        ]);
    }

    /**
     * Test: Deberia actualizar parcialmente un personaje
     */
    public function test_puede_actualizar_parcialmente_un_personaje(): void
    {
        $personaje = personaje::factory()->create([
            'nombre' => 'Waluigi',
            'tipo' => 'Enemigo',
            'mundo' => 'cueva',
            'nivel' => 15,
        ]);

        // Solo actualizamos el nivel
        $response = $this->putJson("/api/personajes/{$personaje->id}", [
            'nivel' => 30,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.nivel', 30)
            ->assertJsonPath('data.nombre', 'Waluigi') // Nombre no cambia
            ->assertJsonPath('data.tipo', 'Enemigo');       // Tipo no cambia
    }

    /**
     * Test: Deberia retornar 404 al actualizar personaje inexistente
     */
    public function test_retorna_404_al_actualizar_personaje_inexistente(): void
    {
        $response = $this->putJson('/api/personajes/9999', [
            'nivel' => 50,
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Personaje no encontrado'
            ]);
    }

    // ============================================
    // TEST 3: Eliminacion de registros
    // ============================================

    /**
     * Test: Deberia eliminar un personaje existente
     */
    public function test_puede_eliminar_un_personaje(): void
    {
        $personaje = personaje::factory()->create();

        $response = $this->deleteJson("/api/personajes/{$personaje->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Personaje eliminado correctamente'
            ]);

        $this->assertDatabaseMissing('personaje', [
            'id' => $personaje->id,
        ]);
    }

    /**
     * Test: Deberia retornar 404 al eliminar personaje inexistente
     */
    public function test_retorna_404_al_eliminar_personaje_inexistente(): void
    {
        $response = $this->deleteJson('/api/personajes/9999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Personaje no encontrado'
            ]);
    }

    // ============================================
    // TEST 4: Validacion de datos
    // ============================================

    /**
     * Test: Deberia fallar al crear personaje sin nombre
     */
    public function test_falla_al_crear_personaje_sin_nombre(): void
    {
        $personajeData = [
            'tipo' => 'aliado',
            'mundo' => 'cueva',
            'nivel' => 10,
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nombre']);
    }

    /**
     * Test: Deberia fallar al crear personaje sin tipo
     */
    public function test_falla_al_crear_personaje_sin_tipo(): void
    {
        $personajeData = [
            'nombre' => 'Koopa',
            'mundo' => 'nubes',
            'nivel' => 25,
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tipo']);
    }

    /**
     * Test: Deberia fallar al crear personaje sin nivel
     */
    public function test_falla_al_crear_personaje_sin_nivel(): void
    {
        $personajeData = [
            'nombre' => 'mario',
            'tipo' => 'heroe',
            'mundo' => 'nubes',
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nivel']);
    }

    /**
     * Test: Deberia fallar al crear personaje con nivel menor a 1
     */
    public function test_falla_al_crear_personaje_con_nivel_menor_a_1(): void
    {
        $personajeData = [
            'nombre' => 'mario',
            'tipo' => 'heroe',
            'mundo' => 'nubes',
            'nivel' => 0,
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nivel']);
    }

    /**
     * Test: Deberia fallar al crear personaje con nivel mayor a 100
     */
    public function test_falla_al_crear_personaje_con_nivel_mayor_a_100(): void
    {
        $personajeData = [
            'nombre' => 'mario',
            'tipo' => 'heroe',
            'mundo' => 'nubes',
            'nivel' => 101,
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nivel']);
    }

}
