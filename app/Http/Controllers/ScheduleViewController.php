<?php

declare(strict_types=1);

namespace App\Http\Controllers;

final class ScheduleViewController
{
    public function __invoke(): \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
    {
        $hasIcsUrl = auth()->user()->ics_url !== null;

        return view('schedule', [
            'hasIcsUrl' => $hasIcsUrl,
        ]);
    }
}
