<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use ICal\ICal;
use Illuminate\Support\Facades\Http;

class ScheduleController extends Controller
{
    // Main page with calendar
    public function index(): \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
    {
        return view('schedule');
    }

    // API-Endpoint, returns events as JSON
    public function events()
    {
        $icsUrl = config('schedule.ics_url');

        $response = Http::get($icsUrl);
        if ($response->failed()) {
            return response()->json(['error' => 'Fehler beim Laden des Stundenplans'], 500);
        }

        $tempPath = storage_path('app/schedule.ics');
        file_put_contents($tempPath, $response->body());

        $ical = new ICal($tempPath, [
            'defaultTimeZone' => 'Europe/Berlin',
            'defaultWeekStart' => 'MO',
        ]);

        $events = collect($ical->events())->map(function ($event): ?array {
            // ICS raw data with time zone information
            $startRaw = $event->dtstart ?? '';
            $endRaw = $event->dtend ?? '';

            // Clean Time-String like "TZID=Europe/Berlin:20251017T083000"
            $startClean = preg_replace('/^TZID=[^:]+:/', '', $startRaw);
            $endClean = preg_replace('/^TZID=[^:]+:/', '', $endRaw);

            // Convert to ISO-Format
            try {
                $startIso = Carbon::createFromFormat('Ymd\THis', $startClean, 'Europe/Berlin')
                    ->toIso8601String();
                $endIso = Carbon::createFromFormat('Ymd\THis', $endClean, 'Europe/Berlin')
                    ->toIso8601String();
            } catch (\Exception) {
                return null;
            }

            return [
                'title' => $event->summary ?? '(Kein Titel)',
                'start' => $startIso,
                'end' => $endIso,
                'location' => $event->location ?? '',
                'description' => $event->description ?? '',
            ];
        })->filter();

        return response()->json($events);
    }
}
