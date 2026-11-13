<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

        <title inertia>{{ config('app.name', 'RepoCred') }}</title>

        <!-- Favicon icon -->
        <link rel="icon" type="image/png" href="{{ asset('images/official/logo_icon.png') }}">
        <link rel="shortcut icon" type="image/png" href="{{ asset('images/official/logo_icon.png') }}">

        <!-- Edumin Main Theme & Skin Styles (includes Bootstrap, FontAwesome, Flaticon, LineAwesome, Themify, etc.) -->
        <link rel="stylesheet" href="{{ asset('css/style.css') }}">
        <link rel="stylesheet" href="{{ asset('css/skin.css') }}">

        <!-- SweetAlert2 Styles & Core Script -->
        <link rel="stylesheet" href="{{ asset('vendor/sweetalert2/dist/sweetalert2.min.css') }}">
        <script src="{{ asset('vendor/sweetalert2/dist/sweetalert2.min.js') }}"></script>


        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased" data-theme-version="light" data-layout="vertical" data-nav-headerbg="color_1" data-headerbg="color_1" data-sidebar-style="full" data-sidebarbg="color_1" data-sidebar-position="fixed" data-header-position="fixed" data-container="wide" direction="ltr">
        @inertia

        <!-- Edumin Vendor & Core Scripts -->
        <script src="{{ asset('vendor/global/global.min.js') }}"></script>
        <script>
            // Nonaktifkan bootstrap-select agar seluruh select memakai style native React yang konsisten
            if (window.jQuery) {
                window.jQuery.fn.selectpicker = function() { return this; };
            }
        </script>
        <script src="{{ asset('js/custom.min.js') }}"></script>
        <script src="{{ asset('js/dlabnav-init.js') }}"></script>
    </body>
</html>
