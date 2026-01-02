# SawargiPay - Modern Payment Gateway

![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

> **⚠️ WORK IN PROGRESS / TAHAP PENGEMBANGAN**
>
> Proyek ini masih dalam tahap pengembangan aktif. Fitur mungkin berubah sewaktu-waktu dan belum sepenuhnya siap untuk penggunaan production. Gunakan dengan risiko Anda sendiri.

SawargiPay adalah platform payment gateway modern yang memungkinkan merchant untuk menerima pembayaran melalui QRIS dengan mudah, aman, dan cepat. Dibangun dengan teknologi web terbaru untuk memastikan performa dan keamanan maksimal.

## 🚀 Fitur Utama

### 🛍️ Merchant Dashboard
- **Real-time Analytics**: Pantau total transaksi, volume penjualan, dan status merchant.
- **Transaction History**: Riwayat transaksi lengkap dengan status pembayaran.
- **Withdrawal System**: Pengajuan penarikan dana ke rekening bank/e-wallet.
- **Profile Management**: Kelola informasi bisnis dan API Key.

### 💳 Payment Integration
- **QRIS Generation**: Integrasi dengan Pakasir API untuk pembuatan QRIS dinamis.
- **Payment Status**: Pengecekan status pembayaran otomatis.
- **Public Payment Page**: Halaman pembayaran yang user-friendly untuk pelanggan.

### 🔒 Keamanan Tingkat Lanjut
- **Password Hashing**: Menggunakan `bcrypt` untuk enkripsi password yang aman.
- **HMAC-SHA256 Signatures**: Verifikasi integritas data untuk setiap request API.
- **OTP Verification**: Verifikasi email menggunakan One-Time Password saat registrasi.
- **Cloudflare Turnstile**: Proteksi anti-bot pada halaman Login dan Register.
- **Admin Approval**: Sistem verifikasi manual oleh admin untuk setiap merchant baru.

### 👮 Admin Portal
- **Merchant Management**: Review dan approve/reject pendaftaran merchant baru.
- **Withdrawal Processing**: Kelola dan proses pengajuan penarikan dana merchant.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes.
- **Database**: MySQL dengan Prisma ORM.
- **Authentication**: Custom Session & JWT (Planned).
- **Email**: Nodemailer (SMTP).
- **Security**: Cloudflare Turnstile, Bcrypt, Crypto (Node.js).

## 📦 Cara Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/AutoFtbot/PG-SawargiPay.git
   cd PG-SawargiPay
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Buat file `.env` di root project dan sesuaikan konfigurasi berikut:
   ```env
   # Database
   DATABASE_URL="mysql://user:password@localhost:3306/sawargipay"

   # App Config
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"

   # Email (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="email@example.com"
   SMTP_PASS="app-password"
   SMTP_SECURE="false"

   # Cloudflare Turnstile
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
   TURNSTILE_SECRET_KEY="your-secret-key"
   ```

4. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 🌐 Deployment ke VPS

Untuk panduan lengkap cara deploy ke VPS (Ubuntu/Debian) menggunakan Nginx dan PM2, silakan baca [Panduan Deployment](DEPLOYMENT.md).

## 📝 API Documentation

Dokumentasi API lengkap tersedia di dalam Dashboard Merchant pada menu **Payments**.

- `POST /api/merchant/qris`: Membuat QRIS baru.
- `GET /api/merchant/payment-status`: Cek status pembayaran.
- `POST /api/merchant/withdraw`: Mengajukan penarikan dana.

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat Pull Request atau laporkan isu jika menemukan bug.

## 📄 Lisensi

[MIT License](LICENSE)
