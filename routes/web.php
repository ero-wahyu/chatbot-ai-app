<?php

use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

// Guest registration
Route::get('/', [ChatController::class, 'index'])->name('home');
Route::post('/register', [ChatController::class, 'register'])->name('register');

// Chat routes (session-based auth)
Route::post('/chat/text', [ChatController::class, 'sendText'])->name('chat.text');
Route::post('/chat/image', [ChatController::class, 'sendImage'])->name('chat.image');
Route::post('/chat/audio', [ChatController::class, 'sendAudio'])->name('chat.audio');
Route::post('/chat/new', [ChatController::class, 'newChat'])->name('chat.new');
Route::get('/chat/{chat}/history', [ChatController::class, 'history'])->name('chat.history');
Route::delete('/chat/{chat}', [ChatController::class, 'deleteChat'])->name('chat.delete');
Route::get('/chats', [ChatController::class, 'listChats'])->name('chats.list');
