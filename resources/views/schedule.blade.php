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
                    <div id="calendar" class="w-full"></div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>
