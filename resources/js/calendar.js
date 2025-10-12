import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

class ScheduleCalendar {
    constructor(elementId) {
        this.calendarEl = document.getElementById(elementId);
        this.calendar = null;
        this.init();
    }

    init() {
        if (!this.calendarEl) {
            console.warn('Calendar element not found');
            return;
        }

        this.calendar = new Calendar(this.calendarEl, this.getConfig());
        this.calendar.render();
    }

    getConfig() {
        return {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
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
                left: 'prev,today,next',
                center: 'title',
                right: 'timeGridWeek,timeGridDay,listWeek'
            },
            events: this.loadEvents.bind(this),
            eventColor: '#6366f1',
            eventTextColor: '#fff',
            eventDisplay: 'block',
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
            eventContent: this.renderEventContent.bind(this),
        };
    }

    async loadEvents(info, successCallback, failureCallback) {
        try {
            const response = await fetch('/api/schedule', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            successCallback(data.data || []);
        } catch (error) {
            console.error('Failed to load calendar events:', error);
            failureCallback(error);
        }
    }

    renderEventContent(arg) {
        const { title, extendedProps: { location } } = arg.event;
        return {
            html: `
                <div class="text-sm leading-tight">
                    <div class="font-semibold">${arg.timeText}</div>
                    ${location ? `<div class="text-xs text-indigo-200">${location}</div>` : ''}
                    <div class="mt-0.5">${title}</div>
                </div>
            `
        };
    }

    destroy() {
        if (this.calendar) {
            this.calendar.destroy();
        }
    }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScheduleCalendar('calendar');
});
