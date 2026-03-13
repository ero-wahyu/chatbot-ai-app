<?php

return [
    'api_key' => env('GEMINI_API_KEY', ''),
    'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    'max_tokens' => env('GEMINI_MAX_TOKENS', 8192),
];
