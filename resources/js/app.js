import "./bootstrap.js";
import "./calendar.js";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js")
            .then((registration) => {
                console.log("Service Worker registered:", registration.scope);

                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener("statechange", () => {
                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            showUpdateNotification(registration);
                        }
                    });
                });
            })
            .catch((error) => {
                console.log("Service Worker registration failed:", error);
            });

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

function showUpdateNotification(registration) {
    const notification = document.createElement("div");
    notification.className =
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-slate-800/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl z-[10000] border border-slate-700/50";
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "polite");
    notification.setAttribute("aria-atomic", "true");

    notification.innerHTML = `
        <div class="flex items-center justify-between space-x-3">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="w-8 h-8 bg-indigo-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </div>
                <span class="text-sm font-medium truncate">Update verfügbar</span>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
                <button class="reload-button text-indigo-400 hover:text-indigo-300 transition-colors p-1.5 rounded-lg hover:bg-indigo-600/20" aria-label="Seite neu laden">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </button>
                <button class="dismiss-button text-slate-400 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-700/50" aria-label="Benachrichtigung schließen">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    const handleUpdate = () => {
        if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
    };

    const handleDismiss = () => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(1rem)";
        setTimeout(() => notification.remove(), 300);
    };

    notification.querySelector(".reload-button").addEventListener(
        "click",
        handleUpdate,
    );
    notification.querySelector(".dismiss-button").addEventListener(
        "click",
        handleDismiss,
    );

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transition = "opacity 300ms, transform 300ms";
    });
}
