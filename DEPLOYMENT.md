# Panduan Deployment ke VPS (Ubuntu/Debian)

Panduan ini akan membantu Anda men-deploy aplikasi SawargiPay ke Virtual Private Server (VPS) menggunakan **Node.js**, **PM2**, **Nginx**, dan **MySQL**.

## 1. Persiapan Server

Pastikan Anda sudah login ke VPS via SSH. Update sistem terlebih dahulu:

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (Versi 18/20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Git, Nginx, dan MySQL
```bash
sudo apt install -y git nginx mysql-server
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 2. Setup Database MySQL

Login ke MySQL:
```bash
sudo mysql
```

Buat database dan user baru:
```sql
CREATE DATABASE sawargipay;
CREATE USER 'sawargi_user'@'localhost' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON sawargipay.* TO 'sawargi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Clone Repository

Clone source code dari GitHub ke folder `/var/www`:

```bash
cd /var/www
sudo git clone https://github.com/AutoFTbot/PG-SawargiPay.git sawargipay
sudo chown -R $USER:$USER sawargipay
cd sawargipay
```

## 4. Instalasi & Konfigurasi

Install dependencies:
```bash
npm install
```

Buat file `.env` (Copy dari contoh atau buat baru):
```bash
nano .env
```

Isi dengan konfigurasi production Anda:
```env
DATABASE_URL="mysql://sawargi_user:password_kuat_anda@localhost:3306/sawargipay"
NEXT_PUBLIC_BASE_URL="https://domain-anda.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="email@example.com"
SMTP_PASS="app-password"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
TURNSTILE_SECRET_KEY="your-secret-key"
```

Setup database schema:
```bash
npx prisma generate
npx prisma db push
```

Build aplikasi Next.js:
```bash
npm run build
```

## 5. Jalankan Aplikasi dengan PM2

Jalankan aplikasi menggunakan PM2 agar tetap berjalan di background:

```bash
pm2 start npm --name "sawargipay" -- start
pm2 save
pm2 startup
```

(Jalankan command output dari `pm2 startup` jika diminta).

## 6. Konfigurasi Nginx (Reverse Proxy)

Buat konfigurasi server block Nginx:

```bash
sudo nano /etc/nginx/sites-available/sawargipay
```

Isi dengan konfigurasi berikut (ganti `domain-anda.com`):

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/sawargipay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Setup SSL (HTTPS) dengan Certbot

Amankan domain Anda dengan SSL gratis dari Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
```

Ikuti instruksi di layar. Pilih opsi redirect HTTP to HTTPS jika ditanya.

## Selesai! 🎉

Aplikasi SawargiPay Anda sekarang sudah live di `https://domain-anda.com`.

---

### Update Aplikasi

Jika ada update kode di GitHub, jalankan perintah ini di server:

```bash
cd /var/www/sawargipay
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart sawargipay
```
