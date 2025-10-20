<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>{{ $title ?? config('app.name') }}</title>

<!-- PWA Capabilities -->
<link rel="manifest" href="/manifest.json" />
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="icon" sizes="192x192" href="/favicon-192x192.png">

@vite(['resources/css/app.css', 'resources/js/app.js'])
@fluxAppearance
