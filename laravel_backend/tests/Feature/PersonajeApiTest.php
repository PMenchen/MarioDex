<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Personaje;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Pruebas de integracion para la API de Personaje 
 * 
 * Verifica el correcto funcionamiento de los endpoints REST,
 * incluyendo codigos de estado HTTP y estructura JSON de respuestas.
 */
class PersonajeApiTest extends TestCase
{
    use RefreshDatabase;

    // ============================================
    // TEST: Endpoint GET /api/personajes
    // ============================================

    /**
     * Test: GET /api/personajes retorna codigo 200
     */
    public function test_get_personajes_retorna_200(): void
    {
        $response = $this->getJson('/api/personajes');

        $response->assertStatus(200);
    }

    /**
     * Test: GET /api/personajes retorna estructura JSON correcta
     */
    public function test_get_personajes_retorna_estructura_json_correcta(): void
    {
        // Creamos algunos Personajes de prueba
        Personaje::factory()->count(3)->create();

        $response = $this->getJson('/api/personajes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'nombre',
                        'tipo',
                        'mundo',
                        'nivel',
                    ]
                ],
                'message'
            ])
            ->assertJson([
                'success' => true,
            ]);
    }

    /**
     * Test: GET /api/personajes retorna lista vacia cuando no hay datos
     */
    public function test_get_personajes_retorna_lista_vacia_sin_datos(): void
    {
        $response = $this->getJson('/api/personajes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [],
            ]);
    }

    /**
     * Test: GET /api/personajes retorna los Personaje correctos
     */
    public function test_get_personajes_retorna_personaje_correctos(): void
    {
        $personaje = Personaje::factory()->create([
            'nombre' => 'Mario',
            'tipo' => 'Heroe',
            'mundo' => 'Reino Champiñon',
            'nivel' => 25,
        ]);

        $response = $this->getJson('/api/personajes');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.nombre', 'Mario')
            ->assertJsonPath('data.0.tipo', 'Heroe')
            ->assertJsonPath('data.0.mundo', 'Reino Champiñon')
            ->assertJsonPath('data.0.nivel', 25);
    }


    // ============================================
    // TEST: Endpoint GET /api/personajes/{id}
    // ============================================

    /**
     * Test: GET /api/personajes/{id} retorna un Personaje especifico
     */
    public function test_get_personaje_por_id_retorna_200(): void
    {
        $personaje = Personaje::factory()->create();

        $response = $this->getJson("/api/personajes/{$personaje->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonPath('data.id', $personaje->id);
    }

    /**
     * Test: GET /api/personajes/{id} retorna 404 para ID inexistente
     */
    public function test_get_personaje_inexistente_retorna_404(): void
    {
        $response = $this->getJson('/api/personajes/9999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Personaje no encontrado',
            ]);
    }

    // ============================================
    // TEST: Endpoint POST /api/personajes
    // ============================================

    /**
     * Test: POST /api/personajes crea un Personaje correctamente
     */
    public function test_post_personaje_crea_correctamente(): void
    {
        $personajeData = [
            'nombre' => 'Yoshi',
            'tipo' => 'Aliado',
            'mundo' => 'Green Hills',
            'nivel' => 5,
        ];

        $response = $this->postJson('/api/personajes', $personajeData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Personaje creado correctamente',
            ])
            ->assertJsonPath('data.nombre', 'Yoshi');
    }

    /**
     * Test: POST /api/personajes con datos invalidos retorna 422
     */
    public function test_post_personaje_invalido_retorna_422(): void
    {
        $response = $this->postJson('/api/personajes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nombre', 'tipo', 'mundo', 'nivel']);
    }

    // ============================================
    // TEST: Endpoint PUT /api/personajes/{id}
    // ============================================

    /**
     * Test: PUT /api/personajes/{id} actualiza correctamente
     */
    public function test_put_personaje_actualiza_correctamente(): void
    {
        $personaje = Personaje::factory()->create(['nivel' => 10]);

        $response = $this->putJson("/api/personajes/{$personaje->id}", [
            'nivel' => 50,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Personaje actualizado correctamente',
            ])
            ->assertJsonPath('data.nivel', 50);
    }

    // ============================================
    // TEST: Endpoint DELETE /api/personajes/{id}
    // ============================================

    /**
     * Test: DELETE /api/personajes/{id} elimina correctamente
     */
    public function test_delete_personaje_elimina_correctamente(): void
    {
        $personaje = Personaje::factory()->create();

        $response = $this->deleteJson("/api/personajes/{$personaje->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Personaje eliminado correctamente',
            ]);

        $this->assertDatabaseMissing('personajes', ['id' => $personaje->id]);
    }

    // ============================================
    // TEST: Flujo completo CRUD
    // ============================================

    /**
     * Test: Flujo completo de creacion, lectura, actualizacion y eliminacion
     */
    public function test_flujo_crud_completo(): void
    {
        // CREATE
        $createResponse = $this->postJson('/api/personajes', [
            'nombre' => 'Koopa',
            'tipo' => 'Enemigo',
            'mundo' => 'forest',
            'nivel' => 70,
        ]);
        $createResponse->assertStatus(201);
        $personajeId = $createResponse->json('data.id');

        // READ
        $readResponse = $this->getJson("/api/personajes/{$personajeId}");
        $readResponse->assertStatus(200)
            ->assertJsonPath('data.nombre', 'Koopa');

        // UPDATE
        $updateResponse = $this->putJson("/api/personajes/{$personajeId}", [
            'nivel' => 100,
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.nivel', 100);

        // DELETE
        $deleteResponse = $this->deleteJson("/api/personajes/{$personajeId}");
        $deleteResponse->assertStatus(200);

        // VERIFY DELETION
        $verifyResponse = $this->getJson("/api/personajes/{$personajeId}");
        $verifyResponse->assertStatus(404);
    }
}
