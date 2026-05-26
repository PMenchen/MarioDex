<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Personaje;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Pruebas unitarias para el modelo Personaje
 * 
 * Verifica las relaciones, atributos fillable y comportamiento del modelo.
 */
class PersonajeModelTest extends TestCase
{
    use RefreshDatabase;

    // ============================================
    // TEST 1: Creacion del modelo
    // ============================================

    /**
     * Test: Deberia crear un Personaje usando factory
     */
    public function test_puede_crear_personaje_con_factory(): void
    {
        $personaje = Personaje::factory()->create();

        $this->assertInstanceOf(Personaje::class, $personaje);
        $this->assertDatabaseHas('personaje', [
            'id' => $personaje->id,
        ]);
    }

    /**
     * Test: Deberia crear un Personaje con atributos especificos
     */
    public function test_puede_crear_personaje_con_atributos(): void
    {
        $personaje = Personaje::factory()->create([
            'nombre' => 'mario',
            'tipo' => 'heroe',
            'mundo' => 'nubes',
            'nivel' => 25,
        ]);

        $this->assertEquals('mario', $personaje->nombre);
        $this->assertEquals('heroe', $personaje->tipo);
        $this->assertEquals('nubes', $personaje->mundo);
        $this->assertEquals(25, $personaje->nivel);
    }

    /**
     * Test: Deberia tener los campos fillable correctos
     */
    public function test_tiene_campos_fillable_correctos(): void
    {
        $personaje = new Personaje();
        $fillable = $personaje->getFillable();

        $this->assertContains('nombre', $fillable);
        $this->assertContains('tipo', $fillable);
        $this->assertContains('mundo', $fillable);
        $this->assertContains('nivel', $fillable);
    }

    // ============================================
    // TEST 2: Actualizacion del modelo
    // ============================================

    /**
     * Test: Deberia actualizar atributos del Personaje
     */
    public function test_puede_actualizar_atributos(): void
    {
        $personaje = Personaje::factory()->create([
            'nivel' => 10,
        ]);

        $personaje->update(['nivel' => 50]);

        $this->assertEquals(50, $personaje->fresh()->nivel);
    }


    // ============================================
    // TEST 3: Eliminacion del modelo
    // ============================================

    /**
     * Test: Deberia eliminar un Personaje
     */
    public function test_puede_eliminar_personaje(): void
    {
        $personaje = Personaje::factory()->create();
        $personajeId = $personaje->id;

        $personaje->delete();

        $this->assertDatabaseMissing('personaje', [
            'id' => $personajeId,
        ]);
    }

    // ============================================
    // TEST: Consultas del modelo
    // ============================================

    /**
     * Test: Deberia obtener todos los Personaje
     */
    public function test_puede_obtener_todos_los_personaje(): void
    {
        Personaje::factory()->count(5)->create();

        $personajes = Personaje::all();

        $this->assertCount(5, $personajes);
    }

    /**
     * Test: Deberia encontrar Personaje por ID
     */
    public function test_puede_encontrar_personaje_por_id(): void
    {
        $personaje = Personaje::factory()->create([
            'nombre' => 'mario',
        ]);

        $found = Personaje::find($personaje->id);

        $this->assertNotNull($found);
        $this->assertEquals('mario', $found->nombre);
    }

    /**
     * Test: Deberia filtrar Personaje por tipo
     */
    public function test_puede_filtrar_por_tipo(): void
    {
        Personaje::factory()->create(['tipo' => 'heroe']);
        Personaje::factory()->create(['tipo' => 'heroe']);
        Personaje::factory()->create(['tipo' => 'aliado']);

        $personajesHeroe = Personaje::where('tipo', 'heroe')->get();

        $this->assertCount(2, $personajesHeroe);
    }


    // ============================================
    // TEST 6: Estados de la Factory
    // ============================================

    /**
     * Test: Factory con estado tipoFuego
     */
    public function test_factory_estado_tipo_fuego(): void
    {
        $Personaje = Personaje::factory()->tipoHeroe()->create();

        $this->assertEquals('Heroe', $Personaje->tipo);
        $this->assertEquals('Reino Champiñon', $Personaje->mundo);
    }

    /**
     * Test: Factory con estado tipoAliado
     */
    public function test_factory_estado_tipo_Aliado(): void
    {
        $Personaje = Personaje::factory()->tipoAliado()->create();

        $this->assertEquals('Aliado', $Personaje->tipo);
        $this->assertEquals('Green Hills', $Personaje->mundo);
    }

    /**
     * Test: Factory con estado nivelMaximo
     */
    public function test_factory_estado_nivel_maximo(): void
    {
        $Personaje = Personaje::factory()->nivelMaximo()->create();

        $this->assertEquals(100, $Personaje->nivel);
    }
}
