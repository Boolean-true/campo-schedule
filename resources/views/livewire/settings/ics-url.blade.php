<section class="w-full">
    @include('partials.settings-heading')

    <x-settings.layout :heading="__('ICS URL')" :subheading="__('Configure your calendar ICS URL')">
        <form wire:submit="updateIcsUrl" class="my-6 w-full space-y-6">
            <flux:input wire:model="ics_url" :label="__('ICS URL')" type="url" required autofocus autocomplete="url" placeholder="https://example.com/calendar.ics" />

            <div class="flex items-center gap-4">
                <div class="flex items-center justify-end">
                    <flux:button variant="primary" type="submit" class="w-full">{{ __('Save') }}</flux:button>
                </div>

                <x-action-message class="me-3" on="ics-url-updated">
                    {{ __('Saved.') }}
                </x-action-message>
            </div>
        </form>
    </x-settings.layout>
</section>
