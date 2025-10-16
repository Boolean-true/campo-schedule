<?php

declare(strict_types=1);

use App\Http\Controllers\ScheduleDataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/schedule', ScheduleDataController::class)->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
