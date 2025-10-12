<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use ICal\ICal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ScheduleDataController extends Controller
{
    public function __invoke(Request $request)
    {
        $response = Http::get(config('schedule.ics_url'))
            ->onError(fn () => response()->json(['error' => 'Fehler beim Laden des Stundenplans'], 500));

        $tempPath = storage_path('app/schedule.ics');
        file_put_contents($tempPath, $response->body());

        $ical = new ICal($tempPath, [
            'defaultTimeZone' => 'Europe/Berlin',
            'defaultWeekStart' => 'MO',
        ]);

        return EventResource::collection(collect($ical->events()));
    }
}
