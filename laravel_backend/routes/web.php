<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'MarioDex API',
        'version' => '1.0.0',
        'endpoints' => [
            'personajes' => '/api/personajes'
        ]
    ]);
});
