@extends('layouts.app')

@section('title', 'Chat — NovaMind AI')

@section('content')
<div class="flex h-screen overflow-hidden" id="chat-app">
    {{-- Sidebar --}}
    <aside id="sidebar" class="sidebar w-72 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 -translate-x-full fixed lg:relative h-full z-30">
        {{-- Sidebar Header --}}
        <div class="p-4 border-b border-gray-800/50">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    </svg>
                </div>
                <div>
                    <h1 class="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NovaMind AI</h1>
                    <p class="text-[10px] text-gray-500">Ignite Ideas with AI</p>
                </div>
            </div>
            <button id="new-chat-btn" class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/20 rounded-xl text-gray-200 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span class="font-medium text-sm">Chat Baru</span>
            </button>
        </div>

        {{-- Chat List --}}
        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1" id="chat-list">
            {{-- Chat items will be rendered by JS --}}
        </div>

        {{-- User Info --}}
        <div class="p-4 border-t border-gray-800/50">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {{ strtoupper(substr($guest->name, 0, 1)) }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-200 truncate">{{ $guest->name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ $guest->email }}</p>
                </div>
            </div>
        </div>
    </aside>

    {{-- Sidebar Overlay (mobile) --}}
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 hidden lg:hidden" onclick="toggleSidebar()"></div>

    {{-- Main Chat Area --}}
    <main class="flex-1 flex flex-col min-w-0">
        {{-- Chat Header --}}
        <header class="h-16 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50 flex items-center px-4 gap-3">
            <button id="sidebar-toggle" class="lg:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors" onclick="toggleSidebar()">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div id="header-persona-icon" class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
                    ✨
                </div>
                <div class="min-w-0">
                    <h2 id="chat-title" class="text-sm font-semibold text-gray-200 truncate">NovaMind AI</h2>
                    <p id="chat-persona-label" class="text-xs text-gray-500">Ignite Ideas with AI</p>
                </div>
            </div>
            <button id="delete-chat-btn" class="p-2 hover:bg-red-500/10 rounded-lg transition-colors group hidden" title="Hapus chat">
                <svg class="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>
        </header>

        {{-- Messages Area --}}
        <div id="messages-container" class="flex-1 overflow-y-auto custom-scrollbar">
            <div id="messages" class="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {{-- Welcome message with persona selector --}}
                <div id="welcome-message" class="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-200 mb-2">Halo, {{ $guest->name }}! 👋</h2>
                    <p class="text-gray-400 max-w-lg text-sm leading-relaxed mb-6">
                        Selamat datang di <strong class="text-indigo-400">NovaMind AI</strong> — Ignite Ideas with AI! Pilih mode asisten atau langsung mulai chat.
                    </p>

                    {{-- Persona Selector Grid --}}
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-2xl mb-6">
                        @foreach($personas as $key => $p)
                        <button class="persona-card group p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/30 hover:border-indigo-500/30 rounded-xl transition-all duration-200 text-left {{ $key === 'general' ? 'ring-2 ring-indigo-500/50 bg-gray-800/60' : '' }}"
                            data-persona="{{ $key }}">
                            <div class="text-2xl mb-1.5">{{ $p['icon'] }}</div>
                            <div class="text-xs font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">{{ $p['name'] }}</div>
                            <div class="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{{ $p['description'] }}</div>
                        </button>
                        @endforeach
                    </div>

                    {{-- Dynamic Suggestions --}}
                    <div id="persona-suggestions" class="flex flex-wrap gap-2 justify-center">
                        {{-- Will be rendered by JS --}}
                    </div>
                </div>
            </div>
        </div>

        {{-- Typing indicator --}}
        <div id="typing-indicator" class="hidden px-4 pb-2">
            <div class="max-w-4xl mx-auto">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                        </svg>
                    </div>
                    <div class="typing-dots bg-gray-800/50 rounded-2xl px-5 py-3">
                        <div class="flex gap-1.5">
                            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Input Area --}}
        <div class="border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-xl p-4">
            <div class="max-w-4xl mx-auto">
                {{-- Image Preview --}}
                <div id="image-preview" class="hidden mb-3">
                    <div class="relative inline-block">
                        <img id="preview-img" src="" alt="Preview" class="h-20 rounded-xl border border-gray-700/50 object-cover">
                        <button id="remove-image" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors">
                            ✕
                        </button>
                    </div>
                </div>

                {{-- Audio Recording Indicator --}}
                <div id="audio-recording" class="hidden mb-3">
                    <div class="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span class="text-red-400 text-sm font-medium">Merekam audio...</span>
                        <span id="recording-time" class="text-red-400/70 text-sm font-mono">00:00</span>
                    </div>
                </div>

                <div class="flex items-end gap-2">
                    {{-- Image Upload --}}
                    <input type="file" id="image-input" accept="image/*" class="hidden">
                    <button id="upload-btn" class="p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group" title="Unggah gambar">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </button>

                    {{-- Audio Record --}}
                    <button id="record-btn" class="p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group" title="Rekam suara">
                        <svg class="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                        </svg>
                    </button>

                    {{-- Text Input --}}
                    <div class="flex-1 relative">
                        <textarea id="message-input" rows="1"
                            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 max-h-32"
                            placeholder="Ketik pesan..."
                            onkeydown="handleKeyDown(event)"></textarea>
                    </div>

                    {{-- Send Button --}}
                    <button id="send-btn" class="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none" title="Kirim">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                    </button>
                </div>

                <p class="text-center text-gray-600 text-xs mt-3">
                    NovaMind AI — Ignite Ideas with AI • Powered by Gemini
                </p>
            </div>
        </div>
    </main>
</div>

{{-- Pass data to JS --}}
@php
    $chatsData = $chats->map(function ($c) {
        return [
            'id' => $c->id,
            'title' => $c->title,
            'persona' => $c->persona,
            'updated_at' => $c->updated_at->toISOString(),
        ];
    });
@endphp
<script>
    window.ChatConfig = {
        csrfToken: '{{ csrf_token() }}',
        guestName: @json($guest->name),
        personas: @json($personas),
        chats: @json($chatsData),
        routes: {
            sendText: '{{ route("chat.text") }}',
            sendImage: '{{ route("chat.image") }}',
            sendAudio: '{{ route("chat.audio") }}',
            newChat: '{{ route("chat.new") }}',
            listChats: '{{ route("chats.list") }}',
            chatHistory: '{{ url("/chat") }}',
            deleteChat: '{{ url("/chat") }}',
        }
    };
</script>
@endsection
