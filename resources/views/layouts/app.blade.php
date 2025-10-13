<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', config('app.name', 'Campo Schedule'))</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet">

    <!-- PWA Capabilities -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="/favicon.png">
    <link rel="icon" sizes="192x192" href="/favicon-192x192.png">

    <!-- Scripts & Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    @stack('styles')
</head>

<body class="font-sans antialiased dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
    <div class="min-h-screen flex flex-col">
        <!-- Navigation -->
        @if (View::hasSection('navigation'))
            <nav class="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <h1 class="text-xl font-semibold text-slate-100">
                                    {{ config('app.name', 'Campo Schedule') }}
                                </h1>
                            </div>
                        </div>
                        @yield('navigation')
                    </div>
                </div>
            </nav>
        @endif

        <!-- Page Header -->
        @if(View::hasSection('header'))
            <header class="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md shadow-lg border-b border-slate-600/50">
                <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    @yield('header')
                </div>
            </header>
        @endif

        <!-- Page Content -->
        <main class="flex-1 @if (!View::hasSection('header')) pt-6 @endif">
            @yield('content')
        </main>

        <!-- Footer -->
        @if (View::hasSection('footer'))
            <footer class="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700">
                <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    @yield('footer')
                </div>
            </footer>
        @endif
    </div>

    @stack('scripts')
</body>
</html>
