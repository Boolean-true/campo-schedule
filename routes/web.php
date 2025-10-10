<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScheduleController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/schedule', [ScheduleController::class, 'index']);
Route::get('/api/schedule', [ScheduleController::class, 'events']); // JSON-Endpunkt
