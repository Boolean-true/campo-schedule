<?php

declare(strict_types=1);

namespace App\Http\Resources;

use ICal\Event;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class EventResource extends JsonResource
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
                'categories' => $event->categories ?? '',
                'type' => $this->getEventType($event->categories ?? ''),
            ],
        ];
    }

    private function getEventType(string $categories): string
    {
        return $categories === 'Übung' ? 'uebung' : 'vorlesung';
    }
}
