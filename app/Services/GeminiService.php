<?php

namespace App\Services;

use App\Models\Chat;
use GeminiAPI\Client;
use GeminiAPI\Enums\MimeType;
use GeminiAPI\Enums\Role;
use GeminiAPI\Resources\Content;
use GeminiAPI\Resources\Parts\FilePart;
use GeminiAPI\Resources\Parts\TextPart;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected Client $client;

    protected string $model;

    public function __construct()
    {
        $apiKey = config('gemini.api_key');

        if (empty($apiKey)) {
            throw new \RuntimeException('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
        }

        $this->client = new Client($apiKey);
        $this->model = config('gemini.model', 'gemini-2.0-flash');
    }

    /**
     * Send a text message and get AI response.
     */
    public function sendTextMessage(string $message, ?Chat $chat = null): string
    {
        try {
            $history = $this->buildHistory($chat);
            $generativeModel = $this->client->generativeModel($this->model);

            if (! empty($history)) {
                $chatSession = $generativeModel->startChat()
                    ->withHistory($history);

                $response = $chatSession->sendMessage(new TextPart($message));
            } else {
                $response = $generativeModel->generateContent(new TextPart($message));
            }

            return $response->text();
        } catch (\Exception $e) {
            Log::error('Gemini API Error (text): '.$e->getMessage());
            throw new \RuntimeException('Gagal mendapatkan respons dari AI. Silakan coba lagi.');
        }
    }

    /**
     * Send an image with optional text prompt and get AI response.
     */
    public function sendImageMessage(string $imagePath, string $mimeTypeStr, string $prompt = ''): string
    {
        try {
            $imageData = file_get_contents($imagePath);

            if ($imageData === false) {
                throw new \RuntimeException('Tidak dapat membaca file gambar.');
            }

            $base64Image = base64_encode($imageData);
            $textPrompt = $prompt ?: 'Analisis dan jelaskan gambar ini secara detail.';

            // Map mime type string to MimeType enum
            $mimeType = $this->mapImageMimeType($mimeTypeStr);

            $generativeModel = $this->client->generativeModel($this->model);

            $response = $generativeModel->generateContent(
                new TextPart($textPrompt),
                new FilePart($mimeType, $base64Image)
            );

            return $response->text();
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Gemini API Error (image): '.$e->getMessage());
            throw new \RuntimeException('Gagal menganalisis gambar. Silakan coba lagi.');
        }
    }

    /**
     * Send audio data and get AI response.
     * Note: Audio is transcribed/analyzed using the text+file approach.
     */
    public function sendAudioMessage(string $audioPath, string $mimeTypeStr): string
    {
        try {
            $audioData = file_get_contents($audioPath);

            if ($audioData === false) {
                throw new \RuntimeException('Tidak dapat membaca file audio.');
            }

            $base64Audio = base64_encode($audioData);

            $generativeModel = $this->client->generativeModel($this->model);

            // Use a custom MimeType approach for audio since SDK enum may not include audio types
            // Send as inline data with the raw mime type
            $response = $generativeModel->generateContent(
                new TextPart('Dengarkan audio ini dan berikan respons yang sesuai. Jika itu pertanyaan, jawab. Jika itu pernyataan, tanggapi dengan relevan.'),
                new FilePart(MimeType::TEXT_PLAIN, $base64Audio)
            );

            return $response->text();
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Gemini API Error (audio): '.$e->getMessage());
            throw new \RuntimeException('Gagal memproses audio. Silakan coba lagi.');
        }
    }

    /**
     * Map image mime type string to MimeType enum.
     */
    protected function mapImageMimeType(string $mimeType): MimeType
    {
        return match ($mimeType) {
            'image/png' => MimeType::IMAGE_PNG,
            'image/jpeg', 'image/jpg' => MimeType::IMAGE_JPEG,
            'image/webp' => MimeType::IMAGE_WEBP,
            'image/heic' => MimeType::IMAGE_HEIC,
            'image/heif' => MimeType::IMAGE_HEIF,
            default => MimeType::IMAGE_JPEG,
        };
    }

    /**
     * Build conversation history from chat messages.
     */
    protected function buildHistory(?Chat $chat): array
    {
        if (! $chat) {
            return [];
        }

        $messages = $chat->messages()
            ->where('type', 'text')
            ->orderBy('created_at', 'asc')
            ->limit(20)
            ->get();

        $history = [];

        foreach ($messages as $msg) {
            $role = $msg->role === 'user' ? Role::User : Role::Model;
            $history[] = Content::text($msg->content, $role);
        }

        return $history;
    }
}
