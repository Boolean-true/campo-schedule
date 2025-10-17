import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

class ScheduleCalendar {
    constructor(elementId) {
        this.calendarEl = document.getElementById(elementId);
        this.calendar = null;
        this.csrfInitialized = false;
        this.isOffline = false;
        this.lastUpdated = null;
        this.isStale = false;
        this.cachedEvents = null;
        this.cachedRange = null;
        this.isFetching = false;
        this.init();
        this.setupOfflineDetection();
    }

    setupOfflineDetection() {
        let onlineTimeout = null;

        window.addEventListener("online", () => {
            this.isOffline = false;
            this.updateOfflineIndicator();

            if (onlineTimeout) {
                clearTimeout(onlineTimeout);
            }

            onlineTimeout = setTimeout(() => {
                if (this.calendar && !this.isFetching) {
                    this.cachedEvents = null;
                    this.cachedRange = null;
                    this.calendar.refetchEvents();
                }
                onlineTimeout = null;
            }, 100);
        });

        window.addEventListener("offline", () => {
            this.isOffline = true;
            this.updateOfflineIndicator();
        });

        this.isOffline = !navigator.onLine;
        this.updateOfflineIndicator();
    }

    updateOfflineIndicator() {
        let indicator = document.getElementById("offline-indicator");

        if (this.isOffline || (this.lastUpdated && this.isStale)) {
            if (!indicator) {
                indicator = document.createElement("div");
                indicator.id = "offline-indicator";
                indicator.className =
                    "fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 transition-all duration-300";
                indicator.setAttribute("role", "status");
                indicator.setAttribute("aria-live", "polite");
                indicator.setAttribute("aria-atomic", "true");
                document.body.appendChild(indicator);
            }

            let content = "";
            if (this.isOffline) {
                content = `
                    <div class="bg-amber-600/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-amber-500/50 flex items-center space-x-3">
                        <div class="w-10 h-10 bg-amber-500/30 rounded-full flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" style="opacity: 0.5"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-semibold">Offline-Modus</div>
                            <div class="text-sm text-amber-100">
                                ${
                    this.lastUpdated
                        ? this.formatLastUpdated()
                        : "Zwischengespeicherte Daten"
                }
                            </div>
                        </div>
                    </div>
                `;
            } else if (this.lastUpdated && this.isStale) {
                content = `
                    <div class="bg-blue-600/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-blue-500/50 flex items-center space-x-3">
                        <svg class="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div class="flex-1 text-sm">
                            ${this.formatLastUpdated()}
                        </div>
                    </div>
                `;
            }

            if (content) {
                indicator.innerHTML = content;
                indicator.style.display = "block";
            } else {
                indicator.style.display = "none";
            }
        } else if (indicator) {
            indicator.style.display = "none";
        }
    }

    formatLastUpdated() {
        if (!this.lastUpdated) return "";

        const now = Date.now();
        const diff = now - this.lastUpdated;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) {
            return `Aktualisiert vor ${days} Tag${days > 1 ? "en" : ""}`;
        } else if (hours > 0) {
            return `Aktualisiert vor ${hours} Stunde${hours > 1 ? "n" : ""}`;
        } else if (minutes > 0) {
            return `Aktualisiert vor ${minutes} Minute${
                minutes > 1 ? "n" : ""
            }`;
        } else {
            return "Gerade aktualisiert";
        }
    }

    init() {
        if (!this.calendarEl) {
            console.warn("Calendar element not found");
            return;
        }

        this.calendar = new Calendar(this.calendarEl, this.getConfig());
        this.calendar.render();
    }

    getConfig() {
        const isMobile = window.innerWidth < 768;

        return {
            plugins: [
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
            ],
            initialView: isMobile ? "listWeek" : "timeGridWeek",
            firstDay: 1,
            hiddenDays: [0, 6],
            slotMinTime: "07:00:00",
            slotMaxTime: "20:00:00",
            allDaySlot: false,
            nowIndicator: true,
            height: "auto",
            locale: "de",
            headerToolbar: {
                left: isMobile ? "prev,next" : "prev,today,next",
                center: "title",
                right: isMobile
                    ? "listWeek,timeGridDay"
                    : "timeGridWeek,timeGridDay,listWeek",
            },
            events: this.loadEvents.bind(this),
            eventTextColor: "#fff",
            eventDisplay: "block",
            slotEventOverlap: false,
            eventOverlap: false,
            eventTimeFormat: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            },
            eventContent: this.renderEventContent.bind(this),
            eventClick: this.handleEventClick.bind(this),
            windowResize: this.handleWindowResize.bind(this),
        };
    }

    getEventColor(event) {
        const type = event.extendedProps?.type;
        if (type === "uebung") {
            return "#059669"; // emerald-600
        }
        return "#6366f1"; // indigo-500 (default)
    }

    handleWindowResize() {
        const isMobile = window.innerWidth < 768;
        const currentView = this.calendar.view.type;

        if (isMobile && currentView === "timeGridWeek") {
            this.calendar.changeView("listWeek");
        } else if (!isMobile && currentView === "listWeek") {
            this.calendar.changeView("timeGridWeek");
        }

        // Update header toolbar based on screen size
        this.calendar.setOption("headerToolbar", {
            left: isMobile ? "prev,next" : "prev,today,next",
            center: "title",
            right: isMobile
                ? "listWeek,timeGridDay"
                : "timeGridWeek,timeGridDay,listWeek",
        });
    }

    async loadEvents(info, successCallback, failureCallback) {
        const requestedStart = info.start.toISOString();
        const requestedEnd = info.end.toISOString();

        if (
            this.cachedEvents !== null &&
            !this.isFetching &&
            this.cachedRange !== null &&
            this.cachedRange.start === requestedStart &&
            this.cachedRange.end === requestedEnd
        ) {
            successCallback(this.cachedEvents);
            return;
        }

        if (this.isFetching) {
            if (this.cachedEvents !== null) {
                successCallback(this.cachedEvents);
            } else {
                successCallback([]);
            }
            return;
        }

        this.isFetching = true;

        try {
            if (!this.csrfInitialized) {
                await fetch("/sanctum/csrf-cookie", {
                    credentials: "same-origin",
                });
                this.csrfInitialized = true;
            }

            const response = await fetch("/api/schedule", {
                headers: {
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error("Unauthorized: User not authenticated");
                    this.isFetching = false;
                    failureCallback(new Error("Authentication required"));
                    return;
                }
                if (response.status === 400) {
                    console.error("Bad Request: ICS URL not configured");
                    this.isFetching = false;
                    failureCallback(new Error("ICS URL not configured"));
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const isFromServiceWorker =
                response.headers.get("X-Offline-Response") === "true";

            this.isOffline = data._offline || isFromServiceWorker || false;
            this.isStale = data._stale || false;
            this.lastUpdated = data._timestamp || Date.now();

            const eventData = Array.isArray(data.data)
                ? data.data
                : (Array.isArray(data) ? data : []);
            const events = eventData.map((event) => ({
                ...event,
                color: this.getEventColor(event),
            }));

            this.cachedEvents = events;
            this.cachedRange = {
                start: requestedStart,
                end: requestedEnd,
            };
            this.isFetching = false;
            this.updateOfflineIndicator();
            successCallback(events);
        } catch (error) {
            console.error("Failed to load calendar events:", error);
            this.isFetching = false;

            if (!navigator.onLine) {
                this.isOffline = true;
                this.updateOfflineIndicator();
            }

            if (this.cachedEvents !== null) {
                successCallback(this.cachedEvents);
            } else {
                successCallback([]);
            }
        }
    }

    renderEventContent(arg) {
        const { title, extendedProps: { location } } = arg.event;
        return {
            html: `
                <div class="text-sm leading-tight cursor-pointer">
                    <div class="font-semibold">${arg.timeText}</div>
                    ${
                location
                    ? `<div class="text-xs text-indigo-200">${location}</div>`
                    : ""
            }
                    <div class="mt-0.5">${title}</div>
                </div>
            `,
        };
    }

    handleEventClick(info) {
        info.jsEvent.preventDefault();
        this.openLectureModal(info.event);
    }

    openLectureModal(event) {
        const modal = this.createModal(event);
        document.body.appendChild(modal);

        // Prevent body scrolling
        document.body.style.overflow = "hidden";

        // Trigger animation
        requestAnimationFrame(() => {
            modal.classList.add("opacity-100");
            const modalContent = modal.querySelector(".modal-content");
            modalContent.classList.remove(
                "translate-y-full",
                "sm:translate-y-4",
                "sm:scale-95",
            );
            modalContent.classList.add("translate-y-0", "sm:scale-100");
        });
    }

    createModal(event) {
        const modal = document.createElement("div");
        modal.className =
            "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300";

        const startTime = new Date(event.start);
        const endTime = new Date(event.end);
        const timeFormatter = new Intl.DateTimeFormat("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        const dateFormatter = new Intl.DateTimeFormat("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        modal.innerHTML = `
            <div class="modal-content bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md transform transition-all duration-300 translate-y-full sm:translate-y-4 sm:scale-95 shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 pb-4">
                    <div class="w-8"></div>
                    <h2 class="text-lg font-semibold text-slate-100">Vorlesung Details</h2>
                    <button class="close-modal w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center transition-colors">
                        <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Content -->
                <div class="px-6 pb-6 space-y-6">
                    <!-- Title -->
                    <div>
                        <h3 class="text-xl font-bold text-white mb-1">${event.title}</h3>
                        <div class="text-sm text-slate-400">${
            dateFormatter.format(startTime)
        }</div>
                    </div>

                    <!-- Time -->
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="text-white font-medium">${
            timeFormatter.format(startTime)
        } - ${timeFormatter.format(endTime)}</div>
                            <div class="text-sm text-slate-400">Dauer: ${
            Math.round((endTime - startTime) / 60000)
        } Minuten</div>
                        </div>
                    </div>

                    ${
            event.extendedProps.location
                ? `
                    <!-- Location -->
                    <div class="flex items-start space-x-3">
                        <div class="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center mt-0.5">
                            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <button class="location-link text-left text-white font-medium hover:text-emerald-400 transition-colors focus:outline-none focus:text-emerald-400" data-geo="${
                    event.extendedProps.geo || ""
                }" data-location="${event.extendedProps.location}">
                                ${event.extendedProps.location}
                            </button>
                            <div class="text-sm text-slate-400 mt-1">Tippen für Navigation</div>
                        </div>
                    </div>
                    `
                : ""
        }

                    ${
            event.extendedProps.description
                ? `
                    <!-- Description -->
                    <div class="flex items-start space-x-3">
                        <div class="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center mt-0.5">
                            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="text-white font-medium mb-1">Beschreibung</div>
                            <div class="text-sm text-slate-300 leading-relaxed">${event.extendedProps.description}</div>
                        </div>
                    </div>
                    `
                : ""
        }

                    <!-- Actions -->
                    <div class="pt-2 space-y-3">
                        ${
            event.extendedProps.url
                ? `
                        <button class="campo-link w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center space-x-2" data-url="${event.extendedProps.url}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            <span>In Campo öffnen</span>
                        </button>
                        `
                : ""
        }
                        <button class="close-modal w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                            Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelectorAll(".close-modal").forEach((btn) => {
            btn.addEventListener("click", () => this.closeModal(modal));
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        // Location click handler
        const locationLink = modal.querySelector(".location-link");
        if (locationLink) {
            locationLink.addEventListener("click", (e) => {
                e.preventDefault();
                const geo = e.target.dataset.geo;
                const location = e.target.dataset.location;
                this.openGoogleMaps(geo, location);
            });
        }

        // Campo link handler
        const campoLink = modal.querySelector(".campo-link");
        if (campoLink) {
            campoLink.addEventListener("click", (e) => {
                e.preventDefault();
                window.open(e.target.closest(".campo-link").dataset.url);
            });
        }

        modal._escHandler = (e) => {
            if (e.key === "Escape") {
                this.closeModal(modal);
            }
        };
        document.addEventListener("keydown", modal._escHandler);

        return modal;
    }

    closeModal(modal) {
        if (modal._escHandler) {
            document.removeEventListener("keydown", modal._escHandler);
            modal._escHandler = null;
        }

        modal.classList.remove("opacity-100");
        const modalContent = modal.querySelector(".modal-content");
        modalContent.classList.remove("translate-y-0", "sm:scale-100");
        modalContent.classList.add(
            "translate-y-full",
            "sm:translate-y-4",
            "sm:scale-95",
        );

        // Restore body scrolling
        document.body.style.overflow = "";

        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    openGoogleMaps(geo, location) {
        let url;
        if (geo && geo.includes(";")) {
            const coords = geo.replace(";", ",");
            url =
                `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
        } else {
            url = `https://www.google.com/maps/dir/?api=1&destination=${
                encodeURIComponent(location)
            }`;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    }

    destroy() {
        if (this.calendar) {
            this.calendar.destroy();
        }
    }
}

// Global calendar instance
let calendarInstance = null;
let isInitializing = false;

// Initialize calendar function
function initializeCalendar() {
    if (isInitializing) {
        return;
    }

    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) {
        if (calendarInstance) {
            calendarInstance.destroy();
            calendarInstance = null;
        }
        return;
    }

    if (calendarInstance) {
        return;
    }

    isInitializing = true;
    calendarInstance = new ScheduleCalendar("calendar");
    isInitializing = false;
}

// Initialize calendar when DOM is ready
document.addEventListener("DOMContentLoaded", initializeCalendar);

// Handle Livewire navigation events
document.addEventListener("livewire:navigated", initializeCalendar);

// Clean up when navigating away
document.addEventListener("livewire:navigating", () => {
    if (calendarInstance) {
        calendarInstance.destroy();
        calendarInstance = null;
    }
});
