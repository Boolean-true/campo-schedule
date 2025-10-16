<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Rules\CampoIcsUrl;
use ICal\ICal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

final class ScheduleDataController
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        abort_if(! $user->ics_url, 400, 'no ics url configured');

        $validator = Validator::make(['ics_url' => $user->ics_url], [
            'ics_url' => ['required', new CampoIcsUrl],
        ]);

        abort_if($validator->fails(), 400, $validator->errors()->first('ics_url'));

        $response = Http::timeout(10)->get($user->ics_url);
        abort_if($response->failed(), 500, 'schedule could not be loaded');

        $icsBody = $response->body();
        abort_unless(str_starts_with($icsBody, 'BEGIN:VCALENDAR'), 400, 'invalid ics data');

        $tempPath = storage_path('app/schedule_'.Str::uuid().'.ics');
        try {
            file_put_contents($tempPath, $icsBody);
            $ical = new ICal($tempPath, [
                'defaultTimeZone' => config('app.timezone', 'Europe/Berlin'),
                'defaultWeekStart' => 'MO',
            ]);

            return EventResource::collection(collect($ical->events()));
        } finally {
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        }
    }
}
