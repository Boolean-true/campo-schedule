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
        $response = Http::get(config('schedule.ics_url'));
        if ($response->failed()) {
            return response()->json(['error' => 'schedule could not be loaded'], 500);
        }

        $tempPath = storage_path('app/schedule.ics');
        $icsBody = $response->body();
        // Validate that the response contains valid ICS data before writing to disk
        if (! str_starts_with($icsBody, 'BEGIN:VCALENDAR')) {
            return response()->json(['error' => 'invalid ics data'], 400);
        }
        file_put_contents($tempPath, $icsBody);

        $ical = new ICal($tempPath, [
            'defaultTimeZone' => 'Europe/Berlin',
            'defaultWeekStart' => 'MO',
        ]);

        return EventResource::collection(collect($ical->events()));
    }
}
