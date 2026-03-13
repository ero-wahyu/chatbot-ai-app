<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Guest;
use App\Models\Message;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Show registration form or chat page.
     */
    public function index(Request $request)
    {
        $guest = $this->getGuest($request);

        if (! $guest) {
            return view('register');
        }

        $chats = $guest->chats()->orderBy('updated_at', 'desc')->get();

        return view('chat', compact('guest', 'chats'));
    }

    /**
     * Register a guest user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
        ]);

        $token = Str::random(64);

        $guest = Guest::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'session_token' => $token,
        ]);

        session(['guest_token' => $token]);

        return redirect('/');
    }

    /**
     * Create a new chat session.
     */
    public function newChat(Request $request)
    {
        $guest = $this->getGuest($request);

        if (! $guest) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $chat = Chat::create([
            'guest_id' => $guest->id,
            'title' => 'Chat Baru',
        ]);

        return response()->json([
            'id' => $chat->id,
            'title' => $chat->title,
            'created_at' => $chat->created_at->toISOString(),
        ]);
    }

    /**
     * List all chats for current guest.
     */
    public function listChats(Request $request)
    {
        $guest = $this->getGuest($request);

        if (! $guest) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $chats = $guest->chats()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn ($chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'updated_at' => $chat->updated_at->toISOString(),
            ]);

        return response()->json($chats);
    }

    /**
     * Get chat message history.
     */
    public function history(Request $request, Chat $chat)
    {
        $guest = $this->getGuest($request);

        if (! $guest || $chat->guest_id !== $guest->id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $messages = $chat->messages()->get()->map(fn ($msg) => [
            'id' => $msg->id,
            'role' => $msg->role,
            'content' => $msg->content,
            'type' => $msg->type,
            'file_path' => $msg->file_path ? Storage::url($msg->file_path) : null,
            'created_at' => $msg->created_at->toISOString(),
        ]);

        return response()->json($messages);
    }

    /**
     * Send a text message.
     */
    public function sendText(Request $request)
    {
        $guest = $this->getGuest($request);

        if (! $guest) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'chat_id' => 'nullable|exists:chats,id',
        ]);

        $chat = $this->resolveChat($guest, $validated['chat_id'] ?? null);

        // Save user message
        Message::create([
            'chat_id' => $chat->id,
            'role' => 'user',
            'content' => $validated['message'],
            'type' => 'text',
        ]);

        // Get AI response
        try {
            $gemini = new GeminiService;
            $aiResponse = $gemini->sendTextMessage($validated['message'], $chat);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }

        // Save assistant message
        $assistantMessage = Message::create([
            'chat_id' => $chat->id,
            'role' => 'assistant',
            'content' => $aiResponse,
            'type' => 'text',
        ]);

        // Update chat title based on first message
        if ($chat->messages()->count() <= 2) {
            $chat->update([
                'title' => Str::limit($validated['message'], 50),
            ]);
        }

        $chat->touch();

        return response()->json([
            'chat_id' => $chat->id,
            'chat_title' => $chat->title,
            'message' => [
                'id' => $assistantMessage->id,
                'role' => 'assistant',
                'content' => $aiResponse,
                'type' => 'text',
                'created_at' => $assistantMessage->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Send an image with optional prompt.
     */
    public function sendImage(Request $request)
    {
        $guest = $this->getGuest($request);

        if (! $guest) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'image' => 'required|image|max:10240',
            'prompt' => 'nullable|string|max:5000',
            'chat_id' => 'nullable|exists:chats,id',
        ]);

        $chat = $this->resolveChat($guest, $validated['chat_id'] ?? null);

        // Store image
        $path = $request->file('image')->store('chat-images', 'public');

        // Save user message
        $userContent = $validated['prompt'] ?? '📷 Gambar dikirim';
        Message::create([
            'chat_id' => $chat->id,
            'role' => 'user',
            'content' => $userContent,
            'type' => 'image',
            'file_path' => $path,
        ]);

        // Get AI response
        try {
            $gemini = new GeminiService;
            $fullPath = Storage::disk('public')->path($path);
            $mimeType = $request->file('image')->getMimeType();
            $aiResponse = $gemini->sendImageMessage($fullPath, $mimeType, $validated['prompt'] ?? '');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }

        // Save assistant message
        $assistantMessage = Message::create([
            'chat_id' => $chat->id,
            'role' => 'assistant',
            'content' => $aiResponse,
            'type' => 'text',
        ]);

        if ($chat->messages()->count() <= 2) {
            $chat->update([
                'title' => Str::limit($userContent, 50),
            ]);
        }

        $chat->touch();

        return response()->json([
            'chat_id' => $chat->id,
            'chat_title' => $chat->title,
            'message' => [
                'id' => $assistantMessage->id,
                'role' => 'assistant',
                'content' => $aiResponse,
                'type' => 'text',
                'created_at' => $assistantMessage->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Send audio.
     */
    public function sendAudio(Request $request)
    {
        $guest = $this->getGuest($request);

        if (! $guest) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'audio' => 'required|file|max:10240',
            'chat_id' => 'nullable|exists:chats,id',
        ]);

        $chat = $this->resolveChat($guest, $validated['chat_id'] ?? null);

        // Store audio
        $path = $request->file('audio')->store('chat-audio', 'public');

        // Save user message
        Message::create([
            'chat_id' => $chat->id,
            'role' => 'user',
            'content' => '🎤 Pesan suara',
            'type' => 'audio',
            'file_path' => $path,
        ]);

        // Get AI response
        try {
            $gemini = new GeminiService;
            $fullPath = Storage::disk('public')->path($path);
            $mimeType = $request->file('audio')->getMimeType() ?: 'audio/webm';
            $aiResponse = $gemini->sendAudioMessage($fullPath, $mimeType);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }

        // Save assistant message
        $assistantMessage = Message::create([
            'chat_id' => $chat->id,
            'role' => 'assistant',
            'content' => $aiResponse,
            'type' => 'text',
        ]);

        if ($chat->messages()->count() <= 2) {
            $chat->update([
                'title' => '🎤 Pesan suara',
            ]);
        }

        $chat->touch();

        return response()->json([
            'chat_id' => $chat->id,
            'chat_title' => $chat->title,
            'message' => [
                'id' => $assistantMessage->id,
                'role' => 'assistant',
                'content' => $aiResponse,
                'type' => 'text',
                'created_at' => $assistantMessage->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Delete a chat.
     */
    public function deleteChat(Request $request, Chat $chat)
    {
        $guest = $this->getGuest($request);

        if (! $guest || $chat->guest_id !== $guest->id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $chat->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get guest from session.
     */
    protected function getGuest(Request $request): ?Guest
    {
        $token = session('guest_token');

        if (! $token) {
            return null;
        }

        return Guest::where('session_token', $token)->first();
    }

    /**
     * Resolve or create a chat.
     */
    protected function resolveChat(Guest $guest, ?int $chatId): Chat
    {
        if ($chatId) {
            $chat = Chat::where('id', $chatId)
                ->where('guest_id', $guest->id)
                ->first();

            if ($chat) {
                return $chat;
            }
        }

        return Chat::create([
            'guest_id' => $guest->id,
            'title' => 'Chat Baru',
        ]);
    }
}
