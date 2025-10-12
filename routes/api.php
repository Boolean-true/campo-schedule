<?php

use App\Http\Controllers\ScheduleDataController;
use Illuminate\Support\Facades\Route;

Route::get('/schedule', ScheduleDataController::class);
