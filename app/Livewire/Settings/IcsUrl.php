<?php

declare(strict_types=1);

namespace App\Livewire\Settings;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

final class IcsUrl extends Component
{
    public string $ics_url = '';

    public function mount(): void
    {
        $this->ics_url = Auth::user()->ics_url ?? '';
    }

    public function updateIcsUrl(): void
    {
        $validated = $this->validate([
            'ics_url' => ['required', 'string', 'url', 'max:255'],
        ]);

        Auth::user()->update($validated);

        $this->dispatch('ics-url-updated');
    }
}
