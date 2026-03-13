<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="NovaMind AI — Ignite Ideas with AI. Asisten cerdas berbasis Gemini AI untuk entrepreneur, kreator, dan freelancer.">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'NovaMind AI — Ignite Ideas with AI')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="bg-gray-950 text-gray-100 font-sans antialiased">
    @yield('content')
</body>

</html>