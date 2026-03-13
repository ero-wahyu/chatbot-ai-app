<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GuestSeeder extends Seeder
{
    public function run(): void
    {
        // Guest 1
        $guest1 = Guest::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'phone' => '081234567890',
            'session_token' => Str::random(64),
        ]);

        $chat1 = Chat::create([
            'guest_id' => $guest1->id,
            'title' => 'Pertanyaan Umum',
        ]);

        Message::create([
            'chat_id' => $chat1->id,
            'role' => 'user',
            'content' => 'Halo, apa itu AI?',
            'type' => 'text',
        ]);

        Message::create([
            'chat_id' => $chat1->id,
            'role' => 'assistant',
            'content' => 'Halo! AI atau Artificial Intelligence (Kecerdasan Buatan) adalah bidang ilmu komputer yang berfokus pada pembuatan mesin yang dapat melakukan tugas-tugas yang biasanya memerlukan kecerdasan manusia, seperti pemahaman bahasa, pengenalan gambar, dan pengambilan keputusan.',
            'type' => 'text',
        ]);

        // Guest 2
        $guest2 = Guest::create([
            'name' => 'Siti Rahayu',
            'email' => 'siti@example.com',
            'phone' => '082345678901',
            'session_token' => Str::random(64),
        ]);

        $chat2 = Chat::create([
            'guest_id' => $guest2->id,
            'title' => 'Bantuan Produk',
        ]);

        Message::create([
            'chat_id' => $chat2->id,
            'role' => 'user',
            'content' => 'Bagaimana cara menggunakan layanan ini?',
            'type' => 'text',
        ]);

        Message::create([
            'chat_id' => $chat2->id,
            'role' => 'assistant',
            'content' => 'Caranya sangat mudah! Anda cukup mengetikkan pertanyaan di kolom chat, atau bisa juga mengunggah gambar dan merekam audio untuk mendapatkan respons dari AI kami. Selamat mencoba!',
            'type' => 'text',
        ]);
    }
}
