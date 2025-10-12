<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ScheduleViewController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
    {
        return view('schedule');
    }
}
