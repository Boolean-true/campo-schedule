const CACHE_VERSION = "v1";
const SCHEDULE_CACHE = `campo-schedule-data-${CACHE_VERSION}`;
const STATIC_CACHE = `campo-schedule-static-${CACHE_VERSION}`;
const CACHE_DURATION = 1000 * 60 * 60 * 24;

const STATIC_ASSETS = [
    "/",
    "/build/manifest.json",
    "/manifest.json",
    "/favicon.png",
    "/favicon-192x192.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS).catch((err) => {
                    console.warn("[SW] Failed to precache some assets:", err);
                });
            })
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) =>
                        name.startsWith("campo-schedule-") &&
                        name !== SCHEDULE_CACHE &&
                        name !== STATIC_CACHE
                    )
                    .map((name) => {
                        return caches.delete(name);
                    }),
            );
        }).then(() => {
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
        event.respondWith(handleScheduleRequest(request));
        return;
    }

    if (
        url.pathname.startsWith("/build/") ||
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".woff2") ||
        url.pathname.endsWith(".woff") ||
        url.pathname.endsWith(".ttf") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".jpg") ||
        url.pathname.endsWith(".jpeg") ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".webp")
    ) {
        event.respondWith(handleStaticAsset(request));
        return;
    }
});

async function handleScheduleRequest(request) {
    try {
        const response = await fetch(request);

        if (response.ok) {
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
            return response;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (_error) {
        console.log("[SW] Fetch failed, checking cache...");
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
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

        return new Response(
            JSON.stringify({ error: "No cached data available" }),
            {
                status: 503,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}

async function handleStaticAsset(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        fetch(request).then((response) => {
            if (response.ok) {
                cache.put(request, response);
            }
        }).catch(() => {});
        return cachedResponse;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log("[SW] Failed to fetch static asset:", request.url);
        return new Response("", { status: 503 });
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
