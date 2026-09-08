# Personal Blog — Development Plan

**v6.0 — Hardening Keamanan & Struktur (Pasca-Review)**
Stack: Next.js · Auth.js v5 · Prisma · MySQL (existing) · Nginx · Docker Compose
Estimasi: 6 fase · ~12–16 minggu

> Dokumen ini menggantikan v5.0. Perubahan: trusted proxy header untuk IP asli pengunjung, sanitasi XSS untuk komentar & konten Tiptap, MySQL user privilege dipersempit + custom Docker network, HTTP security headers di Nginx, validasi upload media di server, anti-enumerasi akun di forgot-password, resource limit container, dan catatan eksplisit soal downtime deploy & backup yang sengaja ditunda.

---

## Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Schema Database & ERD](#3-schema-database--erd)
4. [Ringkasan Fase](#4-ringkasan-fase)
5. [Detail per Fase](#5-detail-per-fase)
6. [Estimasi Biaya Bulanan](#6-estimasi-biaya-bulanan)
7. [Struktur Folder](#7-struktur-folder)
8. [Infrastruktur & Deployment](#8-infrastruktur--deployment)
9. [Backlog — Setelah v1 Live](#9-backlog--setelah-v1-live)
10. [Panduan Mulai](#10-panduan-mulai)
11. [Risiko yang Disadari](#11-risiko-yang-disadari)

---

## 1. Ringkasan Proyek

Personal blog dengan karakter diary digital — berbagi keseharian lewat tulisan, foto, dan stories. Bukan platform sosial; satu pemilik, pembaca bisa berinteraksi lewat komentar dan likes.

### Fitur Utama

- Post teks & foto dengan visibility control (publik / privat / password-protected)
- Stories yang otomatis hilang setelah 24 jam
- Komentar bersarang (reply 1 level) & sistem likes untuk post dan story
- Kategori untuk organisasi konten
- Dark mode bawaan
- Dashboard admin khusus pemilik

### Prinsip Arsitektur

- **Full monolith:** frontend + API dalam satu Next.js project, satu Docker container
- **Layered:** Route Handler → Service → Repository → DB
- Schema database dirancang final dari awal — tidak ditambal belakangan
- Soft delete (`deletedAt`) pada semua entitas utama
- Visibility control per-post, bukan per-user role
- API versioning dari awal: semua Route Handler di bawah `app/api/v1/`

---

## 2. Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend + Backend | Next.js 16 (App Router) | Server Components, Client Components, Route Handlers — satu project |
| Styling | Tailwind CSS | Dark mode via class strategy |
| Auth | Auth.js v5 (NextAuth) | Credentials Provider, `strategy: "jwt"`, `tokenVersion` untuk revocation |
| Validasi | Zod | Semua input divalidasi sebelum masuk service layer |
| ORM | Prisma | Query builder utama, migration, seeding |
| Database | MySQL (existing di VPS) | Koneksi langsung ke MySQL host yang sudah jalan, bukan container baru |
| Media | Cloudinary | Upload, transformasi otomatis, cleanup via API saat delete |
| Email | Resend | Forgot password & notifikasi komentar. Free tier: 3000 email/bulan |
| Rate Limiting | In-memory (`express-rate-limit` pattern / custom Map) | Reliable karena container jalan terus — bukan serverless. IP diambil dari `X-Forwarded-For` (trusted proxy), bukan langsung dari request |
| Sanitasi HTML | `sanitize-html` | Wajib untuk konten Tiptap sebelum simpan ke DB. Komentar guest di-escape biasa (tidak pakai `dangerouslySetInnerHTML`) |
| Logging | Pino | Structured logging ke stdout, dikumpulkan Docker |
| Error Tracking | Sentry | Error tracking di production |
| Testing | Vitest + `next-test-api-route-handler` | Unit test service layer + integration test Route Handlers |
| CI/CD | GitHub Actions | Lint → test → SSH deploy ke VPS |
| Cron | node-cron | Reliable di long-running container, jalankan dari dalam Next.js process |
| Container | Docker + Docker Compose | Satu service `app` untuk Next.js |
| Reverse Proxy | Nginx | Handle SSL (Certbot), routing ke container Next.js |

> **Kenapa `node-cron` balik (bukan Vercel Cron)?**
> Di serverless, process mati setelah setiap request — `node-cron` tidak bisa jalan. Di Docker container yang jalan terus, `node-cron` perfectly valid dan jauh lebih simpel daripada setup endpoint cron + secret terpisah.

> **Kenapa rate limiting in-memory oke di sini?**
> Di Vercel, setiap request bisa kena instance berbeda — counter in-memory tidak shared. Di Docker Compose dengan satu container, semua request lewat satu process Node.js yang sama — in-memory counter reliable.

---

## 3. Schema Database & ERD

Dibandingkan v4: tabel `login_attempts` dihapus (tidak diperlukan lagi karena rate limiting kembali ke in-memory). Tabel `refresh_tokens` tetap tidak ada (Auth.js mengelola sesi sendiri).

### Ringkasan Tabel

| Tabel | Kolom Utama | Catatan |
|---|---|---|
| `users` | id, name, email, passwordHash, avatarUrl, bio, role, tokenVersion, passwordResetToken, passwordResetExpiry | `tokenVersion` untuk revoke sesi Auth.js. Reset token untuk forgot password |
| `posts` | id, userId(FK), title, content, slug, visibility, status, coverImageUrl, passwordHash, publishedAt | passwordHash untuk post PASSWORD_PROTECTED, di-hash bcrypt |
| `stories` | id, userId(FK), caption, visibility, expiresAt | expiresAt = createdAt + 24h |
| `categories` | id, name, slug, color | Tidak soft delete |
| `post_categories` | postId(FK), categoryId(FK) | Pivot M-N, composite PK, cascade delete |
| `comments` | id, postId(FK), userId(FK nullable), parentId(FK), content, guestName, guestEmail | parentId self-ref untuk reply. Guest: isi name+email |
| `likes` | id, userId(FK nullable), guestToken, ipAddress, postId(FK nullable), storyId(FK nullable) | userId null = guest like via cookie anonim |
| `media` | id, userId(FK), postId(FK?), storyId(FK?), type, url, publicId, mimeType, sizeBytes, width, height, sortOrder | publicId untuk Cloudinary delete API |

### ERD — Relasi Utama

```
users         ||--o{  posts           : "menulis"
users         ||--o{  stories         : "membuat"
users         ||--o{  comments        : "menulis / guest"
users         ||--o{  likes           : "memberi (opsional)"
posts         ||--o{  comments        : "menerima"
posts         ||--o{  likes           : "menerima"
posts         ||--o{  post_categories : "termasuk"
posts         ||--o{  media           : "melampirkan"
stories       ||--o{  likes           : "menerima"
stories       ||--o{  media           : "melampirkan"
categories    ||--o{  post_categories : "digunakan di"
comments      ||--o{  comments        : "dibalas (self-ref)"
```

### Keputusan Desain Schema

- **`tokenVersion`:** mekanisme revoke sesi Auth.js yang stateless. Saat owner ganti password atau logout-all-devices, nilai dinaikkan → semua JWT lama invalid
- **`passwordResetToken` + `passwordResetExpiry`:** untuk flow forgot password custom (Auth.js tidak cover ini)
- **Tidak ada `login_attempts`:** rate limiting kembali ke in-memory — valid untuk single container
- **Tidak ada `refresh_tokens`:** Auth.js mengelola cookie JWE-nya sendiri
- **Slug immutable:** tidak berubah saat edit, di-rename saat soft delete ke `slug__deleted__<uuid>`
- **Password post:** di-hash bcrypt
- **publicId Cloudinary:** wajib disimpan untuk delete file dari cloud
- **likes guest:** `userId` nullable, `guestToken` dari cookie UUID anonim + `ipAddress` sebagai fallback — `ipAddress` diambil dari `X-Forwarded-For` tervalidasi, bukan IP Nginx

---

## 4. Ringkasan Fase

| Fase | Judul | Estimasi | Fokus |
|---|---|---|---|
| 1 | Setup & Infrastruktur Dasar | 1–2 minggu | Project init, koneksi MySQL existing, Auth.js config split, Docker setup awal |
| 2 | Autentikasi & Keamanan | 1–2 minggu | Auth.js Credentials, tokenVersion, rate limit in-memory, forgot password |
| 3 | Post & Kategori | 2–3 minggu | CRUD post, visibility, slug, password-protected |
| 4 | Stories & Media | 2–3 minggu | Stories + upload + node-cron cleanup + lifecycle media |
| 5 | Komentar & Likes | 1–2 minggu | Guest comment, nested reply, guest likes via cookie anonim |
| 6 | Polish & Production | 2–3 minggu | Testing, CI/CD, observability, SEO, Nginx + Docker Compose deploy |

---

## 5. Detail per Fase

### Fase 1 — Setup & Infrastruktur Dasar

#### Project Init

- Init Next.js 14 dengan App Router, konfigurasi Tailwind CSS
- Setup environment variables (`.env` + `.env.example`), tambahkan `.env` ke `.gitignore` sekarang
- Setup absolute import alias (`@` → root project)
- Semua API di bawah `app/api/v1/` — versioning dari awal

#### Koneksi ke MySQL Existing

MySQL sudah jalan di VPS — tidak perlu container database baru. Konfigurasi `DATABASE_URL` di `.env`:

```env
# Dari dalam container Docker, host MySQL bukan "localhost"
# Gunakan IP internal VPS atau nama host yang bisa diakses container
DATABASE_URL="mysql://user:password@host.docker.internal:3306/blog_db"

# Atau jika pakai Docker network bridge custom:
DATABASE_URL="mysql://user:password@172.17.0.1:3306/blog_db"
```

> ⚠️ Dari dalam Docker container, `localhost` merujuk ke container itu sendiri — bukan host VPS. Gunakan `host.docker.internal` (Docker Desktop) atau IP gateway bridge (`172.17.0.1` untuk Linux). Di `docker-compose.yml` bisa juga pakai `extra_hosts: ["host.docker.internal:host-gateway"]`.

Pastikan MySQL di VPS sudah dikonfigurasi untuk menerima koneksi dari container:
- User MySQL punya akses dari IP container (bukan hanya `localhost`)
- Port 3306 tidak diblokir firewall internal

> ⚠️ **Custom Docker network, bukan default bridge**
> VPS ini menjalankan service lain — jangan biarkan container blog memakai default bridge network (`172.17.0.0/16`), karena IP range itu dipakai bersama semua container lain di host. Buat network khusus di `docker-compose.yml`:
> ```yaml
> networks:
>   blog_net:
>     driver: bridge
> ```
> Beri user MySQL akses hanya dari subnet network khusus ini (lihat detail di Fase 6 — MySQL Hardening), bukan dari seluruh rentang bridge default.

#### Database & Prisma

- Install Prisma, konfigurasi dengan `DATABASE_URL` di atas
- Buat database baru di MySQL existing: `CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- Tulis `schema.prisma` lengkap — semua tabel dari Bagian 3
- Jalankan: `npx prisma migrate dev --name init`
- Buat `prisma/seed.ts`: 1 user owner + 3 kategori + 2 post sample

#### Auth.js Config Split

Pola wajib Auth.js v5 dengan Prisma — Prisma tidak kompatibel dengan Edge runtime:

- **`auth.config.ts`** — konfigurasi tanpa Prisma: `authorize()`, JWT callbacks. Dipakai di `middleware.ts`
- **`auth.ts`** — konfigurasi lengkap dengan Prisma adapter. Dipakai di Route Handlers

#### Setup API & Cron

- `lib/prisma.ts` — Prisma client singleton
- `lib/api.ts` — response wrapper standar: `{ success, data, message, error }`
- `lib/logger.ts` — Pino instance
- `lib/cron.ts` — inisialisasi `node-cron` jobs, dipanggil dari `instrumentation.ts` Next.js agar hanya jalan sekali saat server start
- `app/api/v1/health/route.ts` — health check endpoint

#### Docker Setup Awal

Buat `Dockerfile` dan `docker-compose.yml` dari awal — deploy nanti di Fase 6, tapi struktur file sudah ada sejak Fase 1 agar tidak kaget di akhir:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    container_name: blog_app
    restart: unless-stopped
    ports:
      - "3000:3000"         # ✏️ sesuaikan port jika konflik dengan service lain
    env_file:
      - .env.production
    extra_hosts:
      - "host.docker.internal:host-gateway"   # akses MySQL di host VPS
    volumes:
      - /etc/localtime:/etc/localtime:ro      # sinkronkan timezone dengan host
    networks:
      - blog_net
    mem_limit: 512m          # ✏️ sesuaikan sesuai kapasitas VPS — cegah satu container habiskan resource
    cpus: 1.0                # ✏️ sesuaikan

networks:
  blog_net:
    driver: bridge
```

> Network khusus (`blog_net`) mengisolasi container blog dari service lain di VPS yang masih memakai default bridge. `mem_limit` dan `cpus` mencegah traffic spike di blog mengganggu service lain yang berbagi VPS.

> **Output Fase 1**
> - Next.js berjalan di `localhost:3000`
> - `GET /api/v1/health` mengembalikan `{ success: true, version: "1.0" }`
> - Database terkoneksi ke MySQL existing, semua tabel terbuat, seed berhasil
> - `auth.config.ts` dan `auth.ts` sudah terpisah
> - `Dockerfile` dan `docker-compose.yml` sudah ada (belum di-deploy ke VPS)
> - `.env` tidak masuk git

---

### Fase 2 — Autentikasi & Keamanan

#### Konfigurasi Auth.js

```env
AUTH_SECRET=...     # wajib, generate dengan: openssl rand -base64 32
AUTH_URL=https://domain-kamu.com
```

- Credentials Provider: validasi email + password di `authorize()`
- `session: { strategy: "jwt" }` — wajib untuk Credentials Provider
- JWT callback: masukkan `userId`, `role`, `tokenVersion` ke token
- Session callback: expose ke client

#### Revocation via `tokenVersion`

- Setiap request yang butuh auth: bandingkan `token.tokenVersion` dengan nilai di DB
- Jika tidak cocok → sesi invalid → redirect ke `/login`
- Saat ganti password atau logout-all-devices: increment `tokenVersion` → semua JWT lama invalid

#### Rate Limiting Login (In-Memory)

Karena container jalan terus (bukan serverless), in-memory Map reliable — **dengan syarat IP yang dipakai adalah IP pengunjung asli, bukan IP Nginx**:

```ts
// lib/rate-limit.ts
const attempts = new Map<string, number[]>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000; // 1 menit
  const max = 5;
  const timestamps = (attempts.get(ip) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= max) return false;
  attempts.set(ip, [...timestamps, now]);
  return true;
}
```

```ts
// lib/get-client-ip.ts
// Trafik selalu lewat Nginx — Next.js melihat IP Nginx (127.0.0.1) kecuali
// X-Forwarded-For dibaca secara eksplisit. Wajib dipakai di SEMUA tempat
// yang butuh IP pengunjung: rate limiter, guest like, rate limit komentar.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Ambil IP pertama dalam chain — itu adalah IP pengunjung asli
    return forwarded.split(',')[0].trim();
  }
  // Fallback jika header tidak ada (seharusnya tidak terjadi di balik Nginx)
  return '0.0.0.0';
}
```

> ⚠️ **Tanpa ini, rate limiter salah sasaran.** Tanpa membaca `X-Forwarded-For`, Next.js akan menganggap semua pengunjung punya IP yang sama (IP Nginx) — satu orang gagal login berulang akan mengunci rate-limit untuk *seluruh* pengunjung, dan semua guest like akan tercatat sebagai satu orang yang sama. Pastikan Nginx selalu mengirim header ini (lihat config Fase 6) dan Route Handler selalu memakai `getClientIp()`, tidak pernah membaca IP request secara langsung.

Panggil `checkLoginRateLimit(getClientIp(req.headers))` di `authorize()` sebelum cek credential.

#### Forgot Password (Custom)

- `POST /api/v1/auth/forgot-password` — generate token UUID, simpan hash ke `passwordResetToken` + `passwordResetExpiry` di tabel `users`, kirim link via Resend (expire 1 jam)
- `POST /api/v1/auth/reset-password` — validasi token, update `passwordHash`, increment `tokenVersion`, hapus token reset

> ⚠️ **Response harus generik — anti-enumerasi akun.** Endpoint forgot-password harus mengembalikan response yang **identik** baik email-nya ditemukan di DB maupun tidak — misalnya selalu `{ success: true, message: "Jika email terdaftar, link reset telah dikirim" }`. Jangan ada perbedaan status code, pesan error, atau timing yang signifikan antara kasus "email ada" dan "email tidak ada". Karena sistem ini single-user, perbedaan respons di sini bisa dipakai siapa pun untuk memastikan alamat email pemilik blog — informasi yang seharusnya tidak publik.

#### Middleware (Edge Runtime)

- `middleware.ts` import dari `auth.config.ts` (bukan `auth.ts`)
- Guard route `(admin)`: redirect ke `/login` jika tidak ada sesi valid
- Validasi `tokenVersion` per request

> **Keputusan: Strategi Auth**
> - Auth.js mengelola cookie JWE — httpOnly, Secure, CSRF protection bawaan
> - `tokenVersion` = cara revoke sesi tanpa tabel refresh token
> - Rate limit login in-memory — valid untuk single container di VPS
> - CSRF aman secara bawaan karena satu origin (Next.js monolith)
> - Forgot password tetap custom — Auth.js tidak cover ini untuk Credentials Provider

---

### Fase 3 — Post & Kategori

Logic bisnis identik dengan v4. Endpoint sekarang Route Handlers.

#### Post Route Handlers

- `GET /api/v1/posts/route.ts` — list post, filter + cursor-based pagination
- `GET /api/v1/posts/[slug]/route.ts` — detail dengan visibility check
- `POST /api/v1/posts/route.ts` — buat post `[auth: owner]`
- `PUT /api/v1/posts/[id]/route.ts` — edit `[auth: owner]`
- `DELETE /api/v1/posts/[id]/route.ts` — soft delete `[auth: owner]`
- `POST /api/v1/posts/[slug]/unlock/route.ts` — unlock post password-protected

#### Kategori Route Handlers

- `GET /api/v1/categories/route.ts`
- `POST /api/v1/categories/route.ts` `[auth: owner]`
- `PUT /api/v1/categories/[id]/route.ts` `[auth: owner]`
- `DELETE /api/v1/categories/[id]/route.ts` `[auth: owner]`

#### Fitur Post Detail

- Rich text editor: **Tiptap**
- Status: `DRAFT` / `PUBLISHED` / `ARCHIVED`
- Visibility: `PUBLIC` / `PRIVATE` / `PASSWORD_PROTECTED`
- Post `PASSWORD_PROTECTED`: `passwordHash` di-hash bcrypt
- Multi-kategori via `post_categories`
- **Sanitasi konten Tiptap:** sebelum `content` (HTML output Tiptap) disimpan ke DB, jalankan lewat `sanitize-html` di service layer — whitelist tag yang dipakai editor (`p`, `strong`, `em`, `h1`-`h3`, `ul`, `li`, `a`, `img`, dst), strip `script`/`on*` attribute apapun. Meski hanya owner yang menulis, ini mencegah HTML berbahaya tersisip lewat plugin/ekstensi editor yang tidak disadari

> **Aturan Slug**
> - Generate: `"Hari ini ke pantai"` → `"hari-ini-ke-pantai"`
> - Collision: tambah suffix angka
> - Saat edit: slug tidak berubah
> - Saat soft delete: di-rename ke `"hari-ini-ke-pantai__deleted__<uuid>"`

---

### Fase 4 — Stories & Media

`node-cron` jalan di dalam Next.js process, diinisialisasi via `instrumentation.ts`.

#### Stories Route Handlers

- `GET /api/v1/stories/route.ts`
- `GET /api/v1/stories/[id]/route.ts`
- `POST /api/v1/stories/route.ts` `[auth: owner]`
- `DELETE /api/v1/stories/[id]/route.ts` `[auth: owner]`

#### Media Route Handlers

- `POST /api/v1/media/upload/route.ts` `[auth: owner]`
  - **Validasi server wajib sebelum file dikirim ke Cloudinary:**
    - Whitelist MIME type: `image/jpeg`, `image/png`, `image/webp` (+ `video/mp4` jika story video diaktifkan)
    - Ukuran maksimal: 10MB per file — tolak di server, jangan andalkan validasi client saja
    - Validasi MIME dari magic bytes file (bukan hanya dari `Content-Type` header yang bisa dipalsukan), misal pakai library `file-type`
- `DELETE /api/v1/media/[id]/route.ts` `[auth: owner]`

> ⚠️ Validasi client (misalnya `accept="image/*"` di `<input>`) hanya UX — bisa dilewati siapa saja yang langsung memanggil endpoint API. Validasi yang menentukan harus di server, sebelum file diteruskan ke Cloudinary.

#### node-cron Setup

```ts
// instrumentation.ts  (Next.js hook — jalan sekali saat server start)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCronJobs } = await import('./lib/cron');
    startCronJobs();
  }
}
```

```ts
// lib/cron.ts
import cron from 'node-cron';

export function startCronJobs() {
  // Setiap jam: cleanup stories expired + media terkait
  cron.schedule('0 * * * *', async () => {
    await cleanupExpiredStories();
    await cleanupOrphanMedia();
  });
}
```

> Gunakan `process.env.NEXT_RUNTIME === 'nodejs'` untuk pastikan cron tidak jalan di Edge runtime.

> **Lifecycle Media**
> - Upload → simpan `url` + `publicId` ke tabel `media`
> - Soft delete post/story → media tidak langsung dihapus
> - Hard delete → hapus dari Cloudinary via `publicId`, hapus record
> - Stories expired → cron hapus otomatis
> - Media orphan → cleanup setelah 24 jam

---

### Fase 5 — Komentar & Likes

Logic identik dengan v4.

#### Komentar Route Handlers

- `GET /api/v1/posts/[slug]/comments/route.ts`
- `POST /api/v1/posts/[slug]/comments/route.ts`
- `POST /api/v1/comments/[id]/reply/route.ts`
- `DELETE /api/v1/comments/[id]/route.ts` `[auth: owner]`

#### Likes Route Handlers

- `POST /api/v1/likes/route.ts` — owner: via session, guest: via cookie anonim
- `DELETE /api/v1/likes/route.ts`

> **Desain Likes Guest (Cookie Anonim)**
> - Guest pertama kali like: server generate UUID, kirim sebagai cookie (HttpOnly, 1 tahun)
> - Like disimpan dengan `guestToken` + `ipAddress`, `userId` null
> - `ipAddress` wajib diambil lewat `getClientIp()` (baca `X-Forwarded-For`) dari `lib/get-client-ip.ts` yang sama dipakai di rate limiter login — bukan IP request langsung, karena trafik selalu lewat Nginx
> - Unique constraint per `guestToken` mencegah double-like dari browser yang sama
> - Batasan: clear cookie = bisa like lagi (acceptable untuk personal blog)

> **Moderasi Komentar & Keamanan Konten**
> - Semua komentar langsung tampil
> - Owner bisa hapus dari dashboard
> - Rate limit per IP: max 5 komentar/menit (pakai `getClientIp()` + pattern in-memory yang sama dengan login)
> - **Sanitasi komentar guest:** konten komentar disimpan sebagai plain text, ditampilkan dengan escaping default React (`{comment.content}`) — **jangan pernah** pakai `dangerouslySetInnerHTML` untuk komentar. Tidak perlu `sanitize-html` di sini karena komentar tidak butuh rich text, escape biasa sudah cukup mencegah XSS

---

### Fase 6 — Polish & Production

#### Testing

- Unit test: **Vitest** untuk semua service layer
- Integration test: **`next-test-api-route-handler`** untuk Route Handlers
- Target: minimal 80% coverage untuk service layer

#### CI/CD — GitHub Actions

Deploy via SSH ke VPS — tidak ada Vercel:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy ke VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /srv/blog                        # ✏️ sesuaikan path
            git pull origin main
            docker compose build --no-cache
            docker compose up -d
            docker compose exec app npx prisma migrate deploy
```

Tambahkan secrets di GitHub repository: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

#### Nginx Config

```nginx
# /etc/nginx/sites-available/blog
server {
    listen 80;
    server_name domain-kamu.com www.domain-kamu.com;  # ✏️ sesuaikan
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name domain-kamu.com www.domain-kamu.com;  # ✏️ sesuaikan

    ssl_certificate     /etc/letsencrypt/live/domain-kamu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain-kamu.com/privkey.pem;

    # ── HTTP Security Headers ──────────────────────────────────────
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' https://res.cloudinary.com data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'" always;
    # ✏️ sesuaikan CSP jika menambah domain eksternal lain (font, analytics, dst)

    # Rate limiting Nginx — lapisan pertama sebelum masuk ke app
    limit_req_zone $binary_remote_addr zone=blog:10m rate=30r/m;
    limit_req zone=blog burst=10 nodelay;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

SSL via Certbot: `certbot --nginx -d domain-kamu.com -d www.domain-kamu.com`

> Nginx sudah jalan di VPS dan handle service lain — cukup tambahkan file config baru di `sites-available` dan symlink ke `sites-enabled`. Tidak perlu ubah config yang sudah ada.

> ⚠️ **`X-Forwarded-For` di config ini wajib ada** — ini yang dibaca `getClientIp()` di Next.js (lihat Fase 2 dan Fase 5). Tanpa baris `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`, semua rate limiter dan pencatatan IP guest like di level aplikasi akan salah sasaran.

#### MySQL Hardening

Karena MySQL ini dipakai bersama (sudah ada sebelum blog ini dibuat) dan VPS menjalankan service lain, persempit privilege user dan akses network:

```sql
-- Buat user dengan privilege spesifik, BUKAN ALL
CREATE USER 'blog_user'@'%' IDENTIFIED BY 'password-kuat';  -- ✏️ ganti password
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_db.* TO 'blog_user'@'%';

-- Privilege DDL (CREATE/ALTER/DROP) hanya dipakai sesaat saat migration —
-- jalankan migration dengan user admin terpisah, BUKAN blog_user runtime:
-- npx prisma migrate deploy  (pakai DATABASE_URL user admin sementara)
-- lalu kembali ke DATABASE_URL blog_user untuk operasional sehari-hari

FLUSH PRIVILEGES;
```

> Akses dibatasi lewat Docker network khusus (`blog_net`, lihat Fase 1) bukan rentang bridge default — kombinasi privilege spesifik + network terisolasi mengurangi permukaan serang dari container lain di VPS yang sama.

#### Observability

- Pino logging: output ke stdout, dikumpulkan Docker (`docker compose logs -f`)
- Sentry: error tracking di production
- Health endpoint `GET /api/v1/health`
- UptimeRobot ping `/api/v1/health` setiap 5 menit

#### Performa & SEO

- `next/image` untuk semua gambar
- SSG untuk post published, ISR revalidasi 60 detik
- Cursor-based pagination
- Metadata per post: Open Graph, Twitter Card
- `sitemap.xml` otomatis dari post public
- `robots.txt`: allow semua kecuali `/admin` dan `/api`
- Checklist a11y: alt text, kontras warna, keyboard navigation

#### Dokumentasi API

- Postman collection paralel sejak Fase 1, simpan di `docs/api.postman.json`

#### Checklist Go-Live

- [ ] `.env.production` sudah ada di VPS, tidak di repository
- [ ] `AUTH_SECRET` diset dengan nilai kuat (`openssl rand -base64 32`)
- [ ] MySQL user `blog_user` punya privilege spesifik (`SELECT, INSERT, UPDATE, DELETE`), bukan `ALL`
- [ ] Container blog berjalan di Docker network khusus (`blog_net`), bukan default bridge
- [ ] `npx prisma migrate deploy` berhasil di DB production
- [ ] `docker compose up -d` berjalan, container healthy, `mem_limit`/`cpus` aktif
- [ ] Nginx config aktif dan sudah `nginx -t` (test config)
- [ ] Nginx mengirim header `X-Forwarded-For` — verifikasi dengan cek log aplikasi menampilkan IP asli pengunjung, bukan `127.0.0.1`
- [ ] HTTP security headers aktif (HSTS, X-Content-Type-Options, X-Frame-Options, CSP) — cek dengan `curl -I https://domain-kamu.com`
- [ ] SSL Certbot aktif, redirect HTTP → HTTPS berjalan
- [ ] `node-cron` jalan — cek log container setelah server start
- [ ] Rate limiting login aktif — test dengan 6 percobaan login berturut-turut dari IP yang sama, pastikan IP lain tidak ikut terkunci
- [ ] Endpoint forgot-password mengembalikan response identik untuk email terdaftar maupun tidak
- [ ] Upload media menolak file di luar whitelist MIME type dan di atas batas ukuran
- [ ] Komentar dengan payload `<script>` tidak ter-eksekusi saat ditampilkan (test manual)
- [ ] Konten post dari Tiptap tersanitasi — test dengan menyisipkan tag berbahaya, pastikan ter-strip
- [ ] Error response tidak expose stack trace
- [ ] Sentry menerima event test
- [ ] UptimeRobot aktif monitoring `https://domain-kamu.com/api/v1/health`
- [ ] Test end-to-end: login, buat post, upload foto, komentar, like (guest & owner), stories
- [ ] `sitemap.xml` dan `robots.txt` bisa diakses
- [ ] Auto-renew SSL berjalan (`certbot renew --dry-run`)

> ⚠️ **Item yang sengaja ditunda (lihat Bagian 11 — Risiko yang Disadari):** backup otomatis MySQL **tidak** masuk checklist go-live ini — tetap di backlog atas keputusan sadar, bukan terlewat. Lihat Bagian 11 untuk implikasinya.

---

## 6. Estimasi Biaya Bulanan

Dengan VPS dan domain sendiri, hampir semua biaya cloud hilang.

| Layanan | Provider | Estimasi/Bulan | Catatan |
|---|---|---|---|
| VPS | Sudah dimiliki | $0 tambahan | Blog jalan di VPS yang sudah ada |
| Domain | Sudah dimiliki | $0 tambahan | Domain yang sudah ada |
| Database | MySQL existing di VPS | $0 tambahan | Pakai instance yang sudah jalan |
| Media | Cloudinary Free | $0 | 25GB storage + 25GB bandwidth/bulan |
| Email | Resend Free | $0 | 3000 email/bulan |
| Error Tracking | Sentry Free | $0 | 5000 events/bulan |
| Uptime Monitor | UptimeRobot Free | $0 | 50 monitor, interval 5 menit |
| SSL | Let's Encrypt (Certbot) | $0 | Auto-renew setiap 90 hari |
| **Total tambahan** | | **~$0/bulan** | Semua infrastruktur sudah dimiliki |

---

## 7. Struktur Folder

```
/
├── app/
│   ├── (public)/                  # Halaman publik
│   ├── (admin)/                   # Dashboard pemilik
│   └── api/
│       └── v1/
│           ├── posts/
│           ├── stories/
│           ├── categories/
│           ├── comments/
│           ├── likes/
│           ├── media/
│           └── health/
├── components/
│   ├── ui/
│   ├── post/
│   ├── story/
│   └── layout/
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   ├── api.ts                     # Response wrapper
│   ├── logger.ts                  # Pino instance
│   ├── cron.ts                    # node-cron jobs
│   ├── rate-limit.ts              # In-memory rate limiter
│   └── utils.ts                   # slugify, formatDate, truncate
├── services/
│   ├── post.service.ts
│   ├── story.service.ts
│   ├── comment.service.ts
│   ├── like.service.ts
│   └── media.service.ts
├── repositories/
│   ├── post.repository.ts
│   ├── story.repository.ts
│   ├── comment.repository.ts
│   ├── like.repository.ts
│   └── media.repository.ts
├── auth.config.ts                 # Auth.js tanpa Prisma — untuk middleware (Edge)
├── auth.ts                        # Auth.js lengkap — untuk Route Handlers (Node)
├── middleware.ts                  # Route guard, import dari auth.config.ts
├── instrumentation.ts             # Next.js hook untuk start node-cron
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   └── api.postman.json
├── Dockerfile
├── docker-compose.yml
├── .env.example                   # Template env — tidak ada nilai asli
├── .github/
│   └── workflows/
│       └── deploy.yml
└── .gitignore
```

> `.env.production` ada di VPS (`/srv/blog/.env.production`), tidak pernah masuk repository.

---

## 8. Infrastruktur & Deployment

### Topologi di VPS

```
Internet
    │
    ▼
[ Nginx :443 ]  ← SSL termination, reverse proxy
    │
    ▼
[ Docker: blog_app :3000 ]  ← Next.js container
    │
    ▼
[ MySQL :3306 ]  ← existing MySQL di host VPS
```

### Setup VPS (Sekali, Sebelum Deploy Pertama)

```bash
# 1. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Buat folder project
sudo mkdir -p /srv/blog          # ✏️ sesuaikan path
sudo chown $USER:$USER /srv/blog
cd /srv/blog

# 3. Clone repository
git clone https://github.com/username/blog.git .  # ✏️ sesuaikan

# 4. Buat .env.production (isi manual, tidak dari repo)
nano .env.production

# 5. Allow MySQL akses dari Docker container
# Di MySQL:
# CREATE USER 'blog_user'@'172.17.0.%' IDENTIFIED BY 'password';
# GRANT ALL ON blog_db.* TO 'blog_user'@'172.17.0.%';

# 6. Build dan jalankan
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed

# 7. Setup Nginx
sudo nano /etc/nginx/sites-available/blog
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. SSL
sudo certbot --nginx -d domain-kamu.com -d www.domain-kamu.com
```

### Perintah Operasional Sehari-hari

```bash
# Lihat log real-time
docker compose logs -f app

# Restart container
docker compose restart app

# Update manual (biasanya via CI/CD)
git pull && docker compose up -d --build

# Jalankan migration manual
docker compose exec app npx prisma migrate deploy

# Masuk ke shell container
docker compose exec app sh

# Cek status container
docker compose ps
```

---

## 9. Backlog — Setelah v1 Live

### Prioritas Tinggi

- **Caching layer:** simpan response populer di in-memory cache (Map dengan TTL) atau Redis container
- **Moderasi komentar:** tambahkan kolom `isApproved`, queue sebelum tampil jika spam meningkat
- **Optimasi gambar upload:** resize/compress di client atau via transformasi Cloudinary

### Prioritas Sedang

- **RSS feed:** generate XML dari post public terbaru
- **Search:** full-text search MySQL
- **Statistik:** view count per post
- **Notifikasi email:** kirim email ke owner saat ada komentar baru (Resend sudah ada)
- **Backup otomatis MySQL** *(lihat Bagian 11 — ditunda dengan sadar, bukan terlewat)*: cron backup ke object storage (Backblaze B2, Cloudflare R2, atau alternatif lain) — provider belum diputuskan, perlu ditentukan sebelum prioritas tinggi lain dikerjakan

### Prioritas Rendah

- Newsletter / mailing list
- Related posts
- Bookmark untuk visitor

---

## 10. Panduan Mulai

### Urutan yang Benar

1. Selesaikan `schema.prisma` — pastikan semua tabel dari Bagian 3 ada
2. Setup project dan folder structure (Fase 1)
3. Test koneksi ke MySQL existing dari local: `npx prisma db push` dulu sebelum migrate
4. Buat `auth.config.ts` dan `auth.ts` terpisah — jangan digabung
5. Jalankan `prisma migrate dev` dan verifikasi semua tabel terbuat
6. Buat `Dockerfile` + `docker-compose.yml` — tes build lokal dulu
7. Test `GET /api/v1/health` dari browser
8. Baru lanjut ke Fase 2 — jangan loncat

### Aturan Penting

- `.env.production` hanya ada di VPS, tidak pernah masuk repository
- Prisma client hanya di Node runtime — jangan import `lib/prisma.ts` di `middleware.ts`
- `middleware.ts` hanya boleh import dari `auth.config.ts` — bukan `auth.ts`
- Semua query database hanya di `repositories/`
- `node-cron` hanya diinisialisasi di `instrumentation.ts` dengan guard `NEXT_RUNTIME === 'nodejs'`
- Setiap perubahan schema: buat migration baru, jangan edit migration lama
- Slug immutable setelah published
- Setelah update di VPS: selalu jalankan `prisma migrate deploy` sebelum restart container

---

## 11. Risiko yang Disadari

Bagian ini mencatat trade-off yang diputuskan secara sadar, bukan kelalaian yang terlewat. Tujuannya supaya keputusan ini terlihat jelas saat ditinjau ulang nanti — bukan ditemukan sebagai "kekurangan" di review berikutnya.

### Tidak ada backup otomatis MySQL saat go-live

**Keputusan:** Backup otomatis MySQL ke object storage **tidak** diimplementasikan sebelum go-live — tetap di backlog, provider belum dipilih.

**Implikasi:**
- Tidak ada redundansi di lapisan manapun pada arsitektur ini (satu VPS, satu container, satu instance MySQL) — lihat juga catatan *single point of failure* di bawah
- Jika MySQL corrupt, disk VPS gagal, atau ada kesalahan operasional (`DROP TABLE` tidak sengaja, migration yang salah), **semua data hilang permanen**: seluruh post, stories, komentar, likes, dan riwayat foto
- Risiko ini meningkat seiring waktu — makin lama ditunda, makin banyak konten yang berpotensi hilang tanpa cara recover

**Mitigasi sementara yang tetap disarankan** (manual, tidak otomatis, tapi jauh lebih baik dari nol):
- Sebelum setiap migration besar atau perubahan schema: `mysqldump blog_db > backup-$(date +%Y%m%d).sql` manual, simpan di luar VPS (download ke laptop/Google Drive)
- Setelah konten mulai bertambah (lebih dari beberapa minggu pemakaian aktif): prioritaskan keputusan provider backup di backlog, jangan ditunda terlalu lama

**Kapan harus direvisit:** sebelum jumlah post/foto cukup banyak sehingga kehilangan data akan terasa berat — bukan ditunda sampai insiden benar-benar terjadi.

### Downtime singkat setiap deploy

**Keputusan:** Strategi deploy (`docker compose up -d --build`) menyebabkan downtime singkat (beberapa detik hingga menit) setiap kali ada update — tidak diimplementasikan zero-downtime deployment (blue-green, rolling update).

**Implikasi:** Pengunjung yang mengakses blog tepat saat deploy berlangsung akan melihat error sesaat. Untuk skala personal blog dengan trafik rendah, ini acceptable — kemungkinan ada pengunjung di detik yang sama saat deploy sangat kecil.

**Kapan harus direvisit:** jika trafik naik signifikan, atau jika deploy mulai dilakukan sangat sering (multiple kali per hari).

### Single point of failure menyeluruh

**Keputusan:** Arsitektur ini sengaja sederhana — satu VPS, satu container, satu instance MySQL, tanpa load balancer atau replika. Ini konsisten dengan skala personal blog dan prinsip "efisien dulu sebelum skala besar".

**Implikasi:** Downtime VPS (maintenance provider, hardware issue, dll) berarti blog sepenuhnya tidak bisa diakses sampai VPS kembali normal. Tidak ada failover otomatis.

**Mitigasi yang sudah ada:** UptimeRobot memberi notifikasi jika blog down, sehingga owner bisa merespons manual secepat mungkin.

**Kapan harus direvisit:** jika blog ini mulai dipakai untuk keperluan yang butuh uptime tinggi (bukan lagi sekadar diary pribadi), atau jika VPS sering mengalami downtime tidak terduga.
