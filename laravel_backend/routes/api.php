<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PersonajeController;

/*
|--------------------------------------------------------------------------
| Rutas de la API - MarioDex
|--------------------------------------------------------------------------
|
| Aqui se definen todas las rutas de la API REST para gestionar
| personajes.
|
| Prefijo: /api (configurado automaticamente por Laravel)
|
*/

// ============================================================================
// RUTAS DE PERSONAJES
// ============================================================================

// GET /api/personajes - Obtener todos los personajes
Route::get('/personajes', [PersonajeController::class, 'index']);

// GET /api/pokemons/{id} - Obtener un Pokemon por ID
Route::get('/personajes/{id}', [PersonajeController::class, 'show']);

// POST /api/pokemons - Crear un nuevo Pokemon
Route::post('/personajes', [PersonajeController::class, 'store']);

// PUT /api/pokemons/{id} - Actualizar un Pokemon existente
Route::put('/personajes/{id}', [PersonajeController::class, 'update']);

// DELETE /api/pokemons/{id} - Eliminar un Pokemon
Route::delete('/personajes/{id}', [PersonajeController::class, 'destroy']);

