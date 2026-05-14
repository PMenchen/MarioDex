<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para crear la tabla de personajes
 */
return new class extends Migration
{
    /**
     * Ejecutar la migración
     */
    public function up(): void
    {
        Schema::create('personaje', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo');
            $table->string('mundo');
            $table->integer('nivel');
            $table->timestamps();
        });
    }

    /**
     * Revertir la migración
     */
    public function down(): void
    {
        Schema::dropIfExists('personajes');
    }
};
