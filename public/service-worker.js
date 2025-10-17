const CACHE_VERSION = "v1";
const SCHEDULE_CACHE = `campo-schedule-data-${CACHE_VERSION}`;
const CACHE_DURATION = 1000 * 60 * 60 * 24;

self.addEventListener("install", (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) =>
                        name.startsWith("campo-schedule-") &&
                        name !== SCHEDULE_CACHE
                    )
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    }),
            );
        }).then(() => {
            console.log('[SW] Service worker activated and ready!');
            return self.clients.claim();
        }),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return;
    }

    if (url.pathname === "/api/schedule") {
        console.log('[SW] Intercepting schedule request');
        event.respondWith(handleScheduleRequest(request));
        return;
    }
});

async function handleScheduleRequest(request) {
    try {
        console.log('[SW] Fetching schedule from network...');
        const response = await fetch(request);

        if (response.ok) {
            console.log('[SW] Schedule fetched successfully, caching...');
            const clonedResponse = response.clone();
            const data = await clonedResponse.json();

            const cache = await caches.open(SCHEDULE_CACHE);
            const scheduleResponse = new Response(JSON.stringify(data), {
                headers: { "Content-Type": "application/json" },
            });
            await cache.put(request, scheduleResponse);

            const timestamp = Date.now();
            const timestampResponse = new Response(
                JSON.stringify({ timestamp }),
                {
                    headers: { "Content-Type": "application/json" },
                },
            );
            await cache.put(`${request.url}-timestamp`, timestampResponse);
            console.log('[SW] Schedule cached successfully!');
        } else {
            console.log('[SW] Schedule fetch failed with status:', response.status);
        }

        return response;
    } catch (_error) {
        console.log('[SW] Network failed, checking cache...');
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] Found cached schedule, returning offline data');
            const timestampResponse = await caches.match(
                `${request.url}-timestamp`,
            );
            let isStale = false;

            if (timestampResponse) {
                const timestampData = await timestampResponse.json();
                const age = Date.now() - timestampData.timestamp;
                isStale = age > CACHE_DURATION;
            }

            const data = await cachedResponse.json();
            const responseData = {
                ...data,
                _offline: true,
                _stale: isStale,
                _timestamp: timestampResponse
                    ? (await timestampResponse.clone().json()).timestamp
                    : null,
            };

            return new Response(JSON.stringify(responseData), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "X-Offline-Response": "true",
                },
            });
        }

        console.log('[SW] No cached data available');
        return new Response(
            JSON.stringify({ error: "No cached data available" }),
            {
                status: 503,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }

    if (event.data && event.data.type === "CLEAR_CACHE") {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith("campo-schedule-"))
                        .map((name) => caches.delete(name)),
                );
            }).then(() => {
                return self.clients.matchAll();
            }).then((clients) => {
                clients.forEach((client) =>
                    client.postMessage({ type: "CACHE_CLEARED" })
                );
            }),
        );
    }
});
