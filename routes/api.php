<?php

use App\Http\Controllers\Api\ChatApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public: Register and get token
    Route::post('/register', [ChatApiController::class, 'register']);

    // Public: List available personas
    Route::get('/personas', [ChatApiController::class, 'listPersonas']);

    // Protected: Requires Bearer token
    Route::post('/chat/text', [ChatApiController::class, 'sendText']);
    Route::post('/chat/image', [ChatApiController::class, 'sendImage']);
    Route::post('/chat/audio', [ChatApiController::class, 'sendAudio']);
    Route::post('/chat/new', [ChatApiController::class, 'newChat']);
    Route::get('/chat/{chat}/history', [ChatApiController::class, 'history']);
    Route::delete('/chat/{chat}', [ChatApiController::class, 'deleteChat']);
    Route::get('/chats', [ChatApiController::class, 'listChats']);
});
