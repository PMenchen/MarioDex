<?php

namespace App\Http\Controllers;

use App\Models\Personaje;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Controlador para gestionar Personajes.
 * 
 * Proporciona operaciones CRUD completas para la entidad Personaje.
 */
class PersonajeController extends Controller
{
    /**
     * Obtiene todos los Pokemon.
     * 
     * Retorna una lista de todos los Pokemon con su entrenador asociado.
     * 
     * @return JsonResponse Lista de Pokemon con codigo 200
     */
    public function index():JsonResponse
    {
        $personajes = Personaje::get();

        return response()->json([
            'success'=> true,
            'data'=>$personajes,
            'message'=>'Listado de personajes obtenido correctamente'
        ]);
    }

    /**
     * Obtiene un Personaje especifico por su ID.
     * 
     * @param int $id ID del Personaje a buscar
     * @return JsonResponse Pokemon encontrado o error 404
     */
    public function show(int $id): JsonResponse
    {
        // Buscar Pokemon por ID incluyendo su entrenador
        $personaje = Personaje::find($id);

        // Verificar si el Pokemon existe
        if (!$personaje) {
            return response()->json([
                'success' => false,
                'message' => 'Personaje no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $personaje,
            'message' => 'Personaje obtenido correctamente'
        ]);
    }

    /**
     * Crea un nuevo Personaje.
     * 
     * Valida los datos de entrada y crea un nuevo registro.
     * 
     * @param Request $request Datos del nuevo Personaje
     * @return JsonResponse Personaje creado con codigo 201
     */
    public function store(Request $request): JsonResponse
    {
        // Validacion de datos de entrada
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:100',
            'mundo' => 'required|string|max:100',
            'nivel' => 'required|integer|min:1|max:100',
        ]);

        // Crear el Personaje con los datos validados
        $personaje = Personaje::create($validated);
        

        return response()->json([
            'success' => true,
            'data' => $personaje,
            'message' => 'Personaje creado correctamente'
        ], 201);
    }

    /**
     * Actualiza un Personaje existente.
     * 
     * Permite actualizar uno o varios campos del Personaje.
     * Usa 'sometimes' para permitir actualizaciones parciales.
     * 
     * @param Request $request Datos a actualizar
     * @param int $id ID del Personaje a actualizar
     * @return JsonResponse Personaje actualizado o error 404
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // Buscar el Personaje a actualizar
        $personaje = Personaje::find($id);

        // Verificar si el Personaje existe
        if (!$personaje) {
            return response()->json([
                'success' => false,
                'message' => 'Personaje no encontrado'
            ], 404);
        }

        // Validación de datos
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'tipo' => 'sometimes|required|string|max:100',
            'mundo' => 'sometimes|string|max:100',
            'nivel' => 'sometimes|required|integer|min:1|max:100',
        ]);

        // Actualizar el Pokemon con los datos validados
        $personaje->update($validated);
        

        return response()->json([
            'success' => true,
            'data' => $personaje,
            'message' => 'Personaje actualizado correctamente'
        ]);
    }

    /**
     * Elimina un Personaje.
     * 
     * Elimina el Personaje de la base de datos.
     * 
     * @param int $id ID del Personaje a eliminar
     * @return JsonResponse Confirmacion de eliminacion o error 404
     */
    public function destroy(int $id): JsonResponse
    {
        // Buscar el Personaje a eliminar
        $personaje = Personaje::find($id);

        // Verificar si el Personaje existe
        if (!$personaje) {
            return response()->json([
                'success' => false,
                'message' => 'Personaje no encontrado'
            ], 404);
        }

        // Eliminar el Personaje
        $personaje->delete();

        return response()->json([
            'success' => true,
            'message' => 'Personaje eliminado correctamente'
        ]);
    }

}