<x-layouts.app :title="__('Schedule')">

    <div class="flex justify-between items-center">
        <h1 class="text-xl font-black text-white leading-tight tracking-tight">
            📅 Stundenplan
        </h1>
    </div>

    <div class="py-4 md:py-8">
        <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div
                class="bg-slate-800/70 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl md:rounded-3xl border border-slate-700/50">
                <div class="p-3 md:p-8">
                    @if($hasIcsUrl)
                        <div id="calendar" class="w-full"></div>
                    @else
                        <div class="text-center py-12">
                            <div class="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-white mb-2">Keine ICS URL konfiguriert</h3>
                            <p class="text-slate-400 mb-6 max-w-md mx-auto">
                                Um deinen Stundenplan zu sehen, musst du zuerst deine ICS URL in den Einstellungen hinterlegen.
                            </p>
                            <flux:button href="{{ route('settings.ics-url') }}" variant="primary">
                                Zu den Einstellungen
                            </flux:button>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>
