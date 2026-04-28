# Product Requirements Document (PRD)
**Project Name:** Sistem Pengingat Adzan Dinamis (Muadzin Scheduler)
**Document Version:** 3.0.0 (Final)
**Target Platform:** Progressive Web App (PWA) / Responsive Web App
**Primary Timezone:** WIB (Asia/Jakarta)
**Default Location Region:** Surabaya (untuk sinkronisasi API Jadwal Shalat)
**Architecture Style:** Decoupled (Frontend SPA + REST API Backend) - Zero-Cost Stack

---

## 1. Executive Summary
Aplikasi web mandiri untuk mendigitalisasi jadwal muadzin yang dinamis. Sistem ini berfungsi sebagai "papan tulis digital" terbuka yang bisa diakses dan diedit oleh pengguna tanpa perlu *login*. Sistem mengotomatisasi pengiriman notifikasi pengingat ke perangkat muadzin (via PWA Push Notification atau Telegram) tepat 15 menit sebelum waktu adzan tiba.

## 2. Technical Architecture & Tech Stack
Sistem menggunakan arsitektur *zero-cost* yang terpisah antara *Frontend* dan *Backend*.

### 2.1 Frontend (Fase 1 - Dikerjakan Pertama)
* **Core:** React (via Vite) atau Next.js.
* **Styling & UI:** Tailwind CSS.
* **State Management:** Zustand atau React Query.
* **PWA:** `vite-plugin-pwa` (untuk dukungan instalasi ke *home screen*).
* **Hosting:** Vercel.

### 2.2 Backend (Fase 2 - Dikerjakan Kedua)
* **Core:** Python 3.11+ dengan framework FastAPI.
* **Database:** Supabase (PostgreSQL).
* **Task Scheduler:** Vercel Cron Jobs (menjalankan *endpoint* `/api/cron/check-reminder` setiap 5 menit).
* **Hosting:** Vercel (Serverless Functions).

---

## 3. User Interface & Experience (UI/UX)
Aplikasi mengusung *Mobile-First Design* dengan pendekatan *open-edit* (tanpa otentikasi).

### 3.1 Navigasi Waktu
* **Horizontal Scroll (Swipeable Tabs):** Bagian atas antarmuka menampilkan 7 hari ke depan yang bisa digeser ke kiri/kanan.
* **Highlight Hari Ini:** Tab untuk "Hari Ini" diberi warna aksen kontras agar mudah dibedakan.
* **Date Picker:** Terdapat ikon kalender untuk memilih dan melompat ke tanggal spesifik di luar rentang 7 hari.

### 3.2 Tampilan Jadwal (Card View)
* Menampilkan daftar 5 waktu shalat secara berurutan (Subuh, Dhuhur, Ashar, Maghrib, Isya).
* Format baris: `[Waktu Shalat] ([Jam Adzan]) : [Nama Muadzin]`. Contoh: `Subuh (04:15) : Akbar`.
* Jika slot kosong, tampilkan tombol *ghost* bertuliskan `+ Isi Jadwal`.

### 3.3 Logika Input & Konfirmasi (Overwrite Protection)
* **Slot Kosong:** Pengguna mengetik nama dan menekan *Save*. Data langsung tersimpan tanpa hambatan.
* **Slot Terisi (Overwrite):** Jika pengguna mengubah nama pada slot yang sudah ada namanya, sistem akan menahan penyimpanan dan memunculkan **Confirmation Modal**.
* **Teks Modal:** *"Jadwal [Waktu Shalat] sudah diisi oleh [Nama Lama]. Yakin ingin menggantinya dengan [Nama Baru]?"*
* **Aksi Modal:** Tombol `[Batal]` dan `[Ya, Ganti]`.

---

## 4. System Logic & Notifications
* **Otomatisasi Pengecekan:** Cron job memanggil API setiap 5 menit.
* **Kondisi Trigger:** `Waktu Adzan - 15 Menit == Waktu Saat Ini`.
* **Pencegahan Spam:** Data yang sudah dikirim notifikasinya akan ditandai dengan `is_notified = true`.
* **Format Pesan Notifikasi:**
  > *"Assalamu'alaikum. Pengingat: Waktu adzan **{Waktu Shalat}** pukul **{Jam Adzan}** kurang 15 menit lagi. Muadzin yang bertugas: **{Nama Muadzin}**. Mohon bersiap."*

---

## 5. Database Schema (PostgreSQL)

### Table: `muadzins`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier |
| `name` | VARCHAR(100) | Not Null | Nama muadzin |
| `contact_id` | VARCHAR(50) | Nullable | ID Telegram / Push Token |

### Table: `schedules`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier |
| `date` | DATE | Not Null | Tanggal bertugas (YYYY-MM-DD) |
| `prayer_time`| VARCHAR(20) | Not Null | Enum: Subuh, Dhuhur, Ashar, Maghrib, Isya |
| `adhan_time` | TIME | Not Null | Waktu adzan (HH:MM) |
| `muadzin_id` | UUID | Foreign Key | Relasi ke tabel `muadzins` |
| `is_notified`| BOOLEAN | Default `false`| Status notifikasi |

---

## 6. API Specifications (FastAPI)

### 6.1 CRUD Jadwal
* `GET /api/v1/schedules` (Query params: `date` atau `start_date` & `end_date`)
* `POST /api/v1/schedules` (Menyimpan jadwal baru)
* `PUT /api/v1/schedules/{id}` (Mengubah nama muadzin pada slot yang sudah ada)

### 6.2 Cron Job / Scheduler
* `POST /api/v1/cron/process-reminders`
* Endpoint ini dilindungi oleh *Bearer Token* internal. Berfungsi mengeksekusi iterasi pengecekan waktu secara asinkron (`asyncio`) untuk mencegah Vercel *timeout*.

---

## 7. Execution Directives for AI Agent

**PHASE 1: FRONTEND ONLY (Current Task)**
1. **Abaikan pembuatan *database* atau *backend* nyata.**
2. Buat struktur *mock data* (JSON lokal) yang mensimulasikan format *response* dari tabel `schedules`.
3. Bangun UI dengan React/Vite + Tailwind CSS sesuai spesifikasi poin 3 (Navigasi swipeable, Date Picker, list 5 waktu shalat).
4. Implementasikan *state management* lokal untuk menangani logika klik tombol `+ Isi Jadwal` dan kemunculan *Confirmation Modal* jika terjadi *overwrite*.
5. Pastikan antarmuka responsif dan optimal di layar ponsel vertikal.

**PHASE 2: BACKEND ONLY (Future Task)**
1. Bangun *endpoint* FastAPI menggunakan Pydantic untuk validasi tipe data.
2. Setup koneksi ke Supabase PostgreSQL.
3. Integrasikan API Jadwal Shalat (wilayah Surabaya) jika jadwal tidak diinput manual.
4. Tulis skrip *cron job* dan integrasi API pengirim pesan (Telegram/FCM).