<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    /**
     * Poblar la base de datos
     */
    public function run(): void
    {
        $this->call([
            PersonajeSeeder::class,
        ]);
    }
}
