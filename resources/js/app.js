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
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-indigo-600 text-white p-4 rounded-xl shadow-2xl z-[10000] flex items-center justify-between space-x-4 border border-indigo-500";
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="font-medium">Neue Version verfügbar</span>
        </div>
        <button class="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors" onclick="this.parentElement.dataset.update()">
            Aktualisieren
        </button>
    `;

    notification.dataset.update = () => {
        if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        notification.remove();
    };

    notification.querySelector("button").addEventListener(
        "click",
        notification.dataset.update,
    );

    document.body.appendChild(notification);
}
