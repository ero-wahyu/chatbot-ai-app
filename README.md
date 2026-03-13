<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI">
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.2+">
</p>

# ✨ NovaMind AI — Ignite Ideas with AI

Aplikasi chatbot web responsif berbasis **Gemini AI** dengan sistem **persona** multi-mode. Mendukung input **teks**, **gambar**, dan **audio** dengan antarmuka modern dark-mode, smart recommendations, dan REST API untuk integrasi eksternal.

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Sistem Persona](#-sistem-persona)
- [Screenshot](#-screenshot)
- [Parameter Kreatif](#-parameter-kreatif)
- [System Requirements](#-system-requirements)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Penggunaan Web](#-penggunaan-web)
- [API Reference](#-api-reference)
- [Struktur Proyek](#-struktur-proyek)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## ✨ Fitur

| Fitur                          | Deskripsi                                                              |
| ------------------------------ | ---------------------------------------------------------------------- |
| 💬 **Chat Teks**               | Kirim pesan teks dan dapatkan respons AI secara real-time              |
| 🖼️ **Analisis Gambar**        | Upload gambar untuk dianalisis oleh Gemini AI                          |
| 🎤 **Input Audio**             | Rekam suara langsung dari browser untuk diproses AI                    |
| 📜 **Riwayat Chat**            | Simpan dan muat kembali riwayat percakapan                             |
| 🎭 **Sistem Persona**          | 7 mode asisten AI dengan system prompt, saran, dan rekomendasi khusus  |
| 💡 **Smart Recommendations**   | Rekomendasi kontekstual otomatis setelah setiap respons AI             |
| 🔮 **Dynamic Suggestions**     | Saran pertanyaan dinamis berdasarkan persona yang dipilih              |
| 🌙 **Dark Mode**               | Antarmuka modern dark-mode dengan glassmorphism                        |
| 📱 **Responsif**               | Tampilan optimal di desktop, tablet, dan mobile                        |
| 🔌 **REST API**                | API lengkap untuk integrasi aplikasi eksternal                         |
| 👤 **Guest Registration**      | Registrasi sederhana tanpa login — cukup nama, email, dan telepon      |

---

## 🎭 Sistem Persona

NovaMind AI memiliki **7 persona** yang dapat dipilih pengguna melalui UI persona selector. Setiap persona memiliki **system prompt**, **saran pertanyaan**, dan **smart recommendations** yang berbeda.

| Persona | Nama | Icon | Deskripsi |
| --- | --- | --- | --- |
| `general` | **NovaMind AI** | ✨ | Asisten AI serba bisa untuk berbagai kebutuhan |
| `customer_service` | **Customer Service Bot** | 🏢 | Layanan pelanggan 24/7 yang responsif dan profesional |
| `education` | **Education Bot** | 📚 | Tutor interaktif untuk memahami berbagai materi pelajaran |
| `travel` | **Travel Assistant** | ✈️ | Rekomendasi perjalanan dan perencanaan itinerary |
| `productivity` | **Productivity Assistant** | 📋 | Manajemen tugas, brainstorming, dan penulisan profesional |
| `health` | **Health & Wellness Bot** | 🏥 | Informasi kesehatan umum dan tips gaya hidup sehat |
| `hobby` | **Hobby & Lifestyle Bot** | 🎨 | Inspirasi kreatif untuk hobi, resep, DIY, dan lifestyle |

### Cara Kerja Persona

1. **System Prompt** — Setiap persona memiliki system prompt unik yang dikirim ke Gemini AI via `withSystemInstruction()`
2. **Dynamic Suggestions** — Setiap persona menampilkan saran pertanyaan berbeda di welcome screen
3. **Smart Recommendations** — Setelah AI merespons, tombol rekomendasi lanjutan muncul sesuai konteks persona
4. **Konfigurasi** — Semua persona dikonfigurasi di `config/personas.php`

---

## 📸 Screenshot

### Halaman Registrasi

Pengguna mengisi nama, email, dan nomor telepon untuk memulai sesi chat.

<p align="center">
  <img src="docs/screenshots/register.png" alt="Halaman Registrasi" width="480">
</p>

### Halaman Chat dengan Persona Selector

Antarmuka chat dengan sidebar riwayat percakapan, persona selector grid, dan input multimodal (teks, gambar, audio).

<p align="center">
  <img src="docs/screenshots/chat.png" alt="Halaman Chat" width="720">
</p>

---

## 🎛️ Parameter Kreatif

### 1. 🗣️ Gaya Bahasa

| Gaya | Deskripsi | Digunakan Pada |
| --- | --- | --- |
| **Formal** | Bahasa baku, profesional, dan sopan | Customer Service, Health |
| **Santai** | Bahasa kasual, ramah, menggunakan emoji | General, Education, Travel, Hobby |
| **Teknis** | Terminologi spesifik, detail, presisi | Productivity |

**Konfigurasi:** Gaya bahasa diatur di system prompt setiap persona dalam `config/personas.php`.

### 2. 🧠 Domain Pengetahuan

Setiap persona difokuskan pada domain tertentu melalui system prompt:

```php
// config/personas.php
'education' => [
    'system_prompt' => 'Kamu adalah NovaMind AI dalam mode Education Bot. 
        Kamu adalah tutor yang sabar, adaptif, dan antusias...',
],
```

### 3. 💾 Memory (Konteks Percakapan)

| Fitur Memory | Status | Deskripsi |
| --- | --- | --- |
| **Short-term Memory** | ✅ Aktif | 20 pesan terakhir dikirim sebagai konteks ke Gemini AI |
| **Persistent History** | ✅ Aktif | Semua pesan tersimpan di database, dapat dimuat ulang |
| **Multi-session** | ✅ Aktif | Setiap guest bisa memiliki banyak sesi chat terpisah |
| **Persona per Chat** | ✅ Aktif | Setiap chat menyimpan persona yang digunakan |

### 4. 💡 Fitur Rekomendasi

| Tipe | Deskripsi |
| --- | --- |
| **Dynamic Suggestions** | Saran pertanyaan di welcome screen, berubah sesuai persona yang dipilih |
| **Smart Recommendations** | Tombol rekomendasi lanjutan muncul otomatis setelah respons AI |
| **Persona-aware** | Rekomendasi disesuaikan dengan konteks persona aktif |

---

## 💻 System Requirements

| Komponen     | Minimum                 | Direkomendasikan          |
| ------------ | ----------------------- | ------------------------- |
| **PHP**      | 8.2                     | 8.3+                      |
| **Composer** | 2.x                     | Latest                    |
| **Node.js**  | 18.x                    | 20.x+                     |
| **NPM**      | 9.x                     | 10.x+                     |
| **Database** | SQLite 3                | MySQL 8.0 / PostgreSQL 15 |
| **OS**       | Windows / macOS / Linux | —                         |

### PHP Extensions yang Diperlukan

- `php-mbstring`
- `php-xml`
- `php-curl`
- `php-sqlite3` (atau `php-mysql` / `php-pgsql`)
- `php-fileinfo`
- `php-gd` atau `php-imagick`

### Akun & API Key

- **Gemini AI API Key** — Dapatkan di [Google AI Studio](https://aistudio.google.com/apikey)

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/chatbot-ai-app.git
cd chatbot-ai-app
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Konfigurasi Environment

```bash
# Salin file environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Setup Database

Secara default, aplikasi menggunakan **SQLite**. File database akan dibuat otomatis.

```bash
# Buat file SQLite (jika belum ada)
touch database/database.sqlite

# Jalankan migrasi
php artisan migrate
```

> **💡 Menggunakan MySQL?** Edit `.env`:
>
> ```env
> DB_CONNECTION=mysql
> DB_HOST=127.0.0.1
> DB_PORT=3306
> DB_DATABASE=chatbot_ai
> DB_USERNAME=root
> DB_PASSWORD=
> ```

### 5. Konfigurasi Gemini AI

Edit file `.env` dan tambahkan API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 6. Setup Storage

```bash
# Buat symbolic link untuk public storage
php artisan storage:link
```

### 7. (Opsional) Jalankan Seeder

```bash
# Seed data contoh (2 guest dengan riwayat chat)
php artisan db:seed
```

### Quick Setup (Satu Perintah)

```bash
composer run setup
```

---

## ⚙️ Konfigurasi

### Environment Variables

| Variable            | Deskripsi                   | Default            |
| ------------------- | --------------------------- | ------------------ |
| `GEMINI_API_KEY`    | API key Gemini AI (wajib)   | —                  |
| `GEMINI_MODEL`      | Model Gemini yang digunakan | `gemini-2.5-flash` |
| `GEMINI_MAX_TOKENS` | Maksimal token respons      | `8192`             |
| `DB_CONNECTION`     | Driver database             | `sqlite`           |
| `SESSION_DRIVER`    | Driver session              | `database`         |
| `QUEUE_CONNECTION`  | Driver queue                | `database`         |

### File Konfigurasi

| File | Deskripsi |
| --- | --- |
| `config/gemini.php` | Konfigurasi Gemini AI (API key, model, max tokens) |
| `config/personas.php` | Konfigurasi persona (system prompt, suggestions, icons, colors) |

---

## ▶️ Menjalankan Aplikasi

### Mode Development

```bash
composer run dev
```

Perintah ini menjalankan secara paralel:

- **Laravel Server** → `http://localhost:8000`
- **Queue Worker** → Memproses job antrian
- **Vite Dev Server** → Hot Module Replacement untuk frontend

### Mode Manual

```bash
# Terminal 1: Laravel Server
php artisan serve

# Terminal 2: Vite Dev Server
npm run dev

# Terminal 3 (opsional): Queue Worker
php artisan queue:listen --tries=1
```

### Build Production

```bash
npm run build
```

Akses aplikasi di: **http://localhost:8000**

---

## 📖 Penggunaan Web

### 1. Registrasi

1. Buka `http://localhost:8000`
2. Isi form registrasi: **Nama Lengkap**, **Email**, dan **No. Telepon**
3. Klik tombol **"Mulai Chat"**

### 2. Pilih Persona

1. Di halaman chat, pilih persona dari **grid persona selector** di welcome screen
2. Persona yang dipilih akan mengubah system prompt AI, saran pertanyaan, dan rekomendasi
3. Persona default: **NovaMind AI** (general)

### 3. Chat Teks

1. Ketik pesan di kolom input di bagian bawah
2. Tekan **Enter** atau klik tombol **Send**
3. Setelah AI merespons, tombol **Smart Recommendations** akan muncul untuk pertanyaan lanjutan

### 4. Upload Gambar

1. Klik ikon **gambar** (📷) di sebelah kiri kolom input
2. Pilih file gambar (max 10MB, format: JPG, PNG, WebP, HEIC)
3. _Opsional:_ Tambahkan deskripsi/prompt di kolom teks
4. Klik **Send** — AI akan menganalisis dan menjelaskan gambar

### 5. Rekam Audio

1. Klik ikon **mikrofon** (🎤)
2. Izinkan akses mikrofon jika diminta browser
3. Klik ikon mikrofon lagi untuk menghentikan dan mengirim

### 6. Kelola Riwayat Chat

- **Chat Baru:** Klik tombol **"+ Chat Baru"** di sidebar
- **Muat Chat:** Klik judul chat di sidebar untuk memuat riwayat
- **Hapus Chat:** Klik ikon **tempat sampah** (🗑) di header chat

---

## 🔌 API Reference

API tersedia di prefix `/api/v1` untuk integrasi aplikasi eksternal. Autentikasi menggunakan **Bearer Token** yang didapat saat registrasi.

### Base URL

```
http://localhost:8000/api/v1
```

### Headers Umum

```
Authorization: Bearer {token}
Accept: application/json
```

---

### 1. Register Guest

```http
POST /api/v1/register
Content-Type: application/json
```

**Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890"
}
```

**Response** `201 Created`:

```json
{
    "message": "Registrasi berhasil",
    "token": "abc123...xyz789",
    "guest": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

---

### 2. List Personas

```http
GET /api/v1/personas
```

**Response** `200 OK`:

```json
{
    "personas": [
        {
            "key": "general",
            "name": "NovaMind AI",
            "icon": "✨",
            "description": "Asisten AI serba bisa untuk berbagai kebutuhan Anda",
            "style": "santai"
        }
    ]
}
```

---

### 3. Kirim Pesan Teks

```http
POST /api/v1/chat/text
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
    "message": "Apa itu artificial intelligence?",
    "chat_id": 1,
    "persona": "education"
}
```

> `chat_id` dan `persona` opsional. Jika `chat_id` tidak diisi, chat baru akan dibuat otomatis.

**Response** `200 OK`:

```json
{
    "chat_id": 1,
    "chat_title": "Apa itu artificial intelligence?",
    "persona": "education",
    "response": {
        "id": 2,
        "role": "assistant",
        "content": "Artificial Intelligence (AI) adalah...",
        "type": "text",
        "created_at": "2026-03-13T12:00:00.000000Z"
    }
}
```

---

### 4. Kirim Gambar

```http
POST /api/v1/chat/image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Required | Deskripsi |
|-------|------|----------|-----------|
| `image` | File | ✅ | File gambar (max 10MB) |
| `prompt` | String | ❌ | Prompt untuk analisis gambar |
| `chat_id` | Integer | ❌ | ID chat yang ada |
| `persona` | String | ❌ | Key persona (default: general) |

---

### 5. Kirim Audio

```http
POST /api/v1/chat/audio
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Required | Deskripsi |
|-------|------|----------|-----------|
| `audio` | File | ✅ | File audio (max 10MB) |
| `chat_id` | Integer | ❌ | ID chat yang ada |
| `persona` | String | ❌ | Key persona (default: general) |

---

### 6. Buat Chat Baru

```http
POST /api/v1/chat/new
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (opsional):**

```json
{
    "persona": "travel"
}
```

---

### 7. Daftar Semua Chat

```http
GET /api/v1/chats
Authorization: Bearer {token}
```

---

### 8. Riwayat Chat

```http
GET /api/v1/chat/{chat_id}/history
Authorization: Bearer {token}
```

---

### 9. Hapus Chat

```http
DELETE /api/v1/chat/{chat_id}
Authorization: Bearer {token}
```

---

### Error Responses

| Status Code                 | Deskripsi                                 |
| --------------------------- | ----------------------------------------- |
| `401 Unauthorized`          | Token tidak valid atau tidak disertakan   |
| `403 Forbidden`             | Akses ditolak (chat milik user lain)      |
| `422 Unprocessable Entity`  | Validasi input gagal                      |
| `500 Internal Server Error` | Error sisi server (Gemini API gagal, dll) |

---

## 📁 Struktur Proyek

```
chatbot-ai-app/
├── app/
│   ├── Http/Controllers/
│   │   ├── ChatController.php         # Controller web (session-based)
│   │   └── Api/
│   │       └── ChatApiController.php  # Controller REST API (Bearer token)
│   ├── Models/
│   │   ├── Guest.php                  # Model guest/pengguna
│   │   ├── Chat.php                   # Model sesi chat (+ persona field)
│   │   └── Message.php                # Model pesan
│   └── Services/
│       └── GeminiService.php          # Integrasi Gemini AI API + system prompt
├── config/
│   ├── gemini.php                     # Konfigurasi Gemini AI
│   └── personas.php                   # Konfigurasi persona (7 persona)
├── database/
│   ├── migrations/
│   │   ├── create_guests_table.php
│   │   ├── create_chats_table.php
│   │   └── create_messages_table.php
│   └── seeders/
│       └── DatabaseSeeder.php         # Data contoh
├── resources/
│   ├── views/
│   │   ├── layouts/app.blade.php      # Layout utama
│   │   ├── register.blade.php         # Halaman registrasi
│   │   └── chat.blade.php             # Halaman chat + persona selector
│   ├── js/
│   │   ├── app.js                     # Entry point
│   │   ├── bootstrap.js               # Axios setup
│   │   └── chat.js                    # Logika chat + persona + recommendations
│   └── css/
│       └── app.css                    # Stylesheet (TailwindCSS)
├── routes/
│   ├── web.php                        # Routes web
│   └── api.php                        # Routes API v1
├── .env.example                       # Template environment
├── composer.json                      # PHP dependencies
├── package.json                       # Node.js dependencies
└── vite.config.js                     # Vite + TailwindCSS config
```

---

## 🔧 Troubleshooting

### "Gemini API key is not configured"

Pastikan variabel `GEMINI_API_KEY` sudah diset di file `.env`:

```env
GEMINI_API_KEY=AIzaSy...
```

Kemudian clear config cache:

```bash
php artisan config:clear
```

### "Gagal mendapatkan respons dari AI"

1. Periksa API key masih valid di [Google AI Studio](https://aistudio.google.com/apikey)
2. Periksa koneksi internet
3. Periksa log di `storage/logs/laravel.log`

### Gambar tidak muncul setelah upload

```bash
php artisan storage:link
```

### Error "CSRF token mismatch"

```bash
php artisan cache:clear
php artisan config:clear
```

### Vite manifest not found

```bash
npm run build
```

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).

---

<p align="center">
  <strong>NovaMind AI</strong> — Ignite Ideas with AI ✨<br>
  Dibuat dengan Laravel 12 + Gemini AI
</p>
