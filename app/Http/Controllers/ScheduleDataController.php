<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use ICal\ICal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

final class ScheduleDataController
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        if (! $user->ics_url) {
            return response()->json(['error' => 'no ics url configured'], 400);
        }

        $response = Http::get($user->ics_url);
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
