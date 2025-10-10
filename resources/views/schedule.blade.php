<!DOCTYPE html>
<html lang="de" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📅 Stundenplan</title>

    {{-- FullCalendar Styles --}}
    <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css" rel="stylesheet">
    {{-- Tailwind --}}
    <script src="https://cdn.tailwindcss.com"></script>

    <script>
        // Enable Tailwind Darkmode
        tailwind.config = {
            darkMode: 'class',
        }
    </script>

    <style>
        body.dark {
            background-color: #0f172a;
            color: #e2e8f0;
        }
        .fc {
            background-color: transparent;
        }
        .fc-theme-standard td, .fc-theme-standard th {
            border-color: #334155;
        }
        .fc-toolbar-title {
            color: #f8fafc;
        }
        /* Time in left column */
        .fc-timegrid-slot-label {
            color: #cbd5e1;
            font-weight: 600;
        }
        /* Day like Mo. 13.10. */
        .fc-col-header-cell-cushion {
            color: #000000;
            font-weight: 600;
        }
    </style>
</head>
<body class="dark flex flex-col min-h-screen transition-colors duration-300">
    <!-- Header with change to Lightmode
    <header class="bg-indigo-700 text-white py-4 shadow-md flex justify-between items-center px-6">
        <h1 class="text-2xl font-bold">📅 Mein Stundenplan</h1>
        <button id="theme-toggle" class="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded text-sm">
            🌙 Dark / ☀️ Light
        </button>
    </header>
    -->

    <main class="flex-1 p-6">
        <div id="calendar" class="w-full mx-auto rounded-2xl shadow p-4 bg-gray-800/50"></div>
    </main>

    <footer class="text-center text-gray-400 text-sm py-4">
        Powered by Laravel + FullCalendar
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const calendarEl = document.getElementById('calendar');

            const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            firstDay: 1,
            hiddenDays: [0, 6],
            slotMinTime: '07:00:00',
            slotMaxTime: '20:00:00',
            allDaySlot: false,
            nowIndicator: true,
            height: 'auto',
            locale: 'de',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay'
            },
            events: '/api/schedule',
            eventColor: '#6366f1',
            eventTextColor: '#fff',
            eventDisplay: 'block',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },

            // Event-Rendering
            eventContent: function(arg) {
                const title = arg.event.title;
                const location = arg.event.extendedProps.location;
                const timeText = arg.timeText;

                return {
                    html: `
                        <div class="text-sm leading-tight">
                            <div class="font-semibold">${timeText}</div>
                            <div class="text-xs text-indigo-200">${location || ''}</div>
                            <div class="mt-0.5">${title}</div>
                        </div>
                    `
                    };
                },
            });

            calendar.render();

            // Darkmode-Toggle
            const btn = document.getElementById('theme-toggle');
            btn.addEventListener('click', () => {
                document.body.classList.toggle('dark');
            });
        });
    </script>
</body>
</html>
