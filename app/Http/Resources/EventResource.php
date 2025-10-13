<?php

namespace App\Http\Resources;

use ICal\Event;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): ?array
    {
        /** @var Event $event */
        $event = $this->resource;

        return [
            'title' => $event->summary,
            'start' => $event->dtstart,
            'end' => $event->dtend,
            'extendedProps' => [
                'location' => $event->location ?? '',
                'description' => $event->description ?? '',
                'geo' => $event->geo ?? '',
                'url' => $event->url ?? '',
            ],
        ];
    }
}
