<?php

use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/schedule', [ScheduleController::class, 'index']);
Route::get('/api/schedule', [ScheduleController::class, 'events']); // JSON-Endpunkt
