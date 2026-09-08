# 🚀 Kadalio — Ruang Berpikir & Dokumentasi Web

<div align="center">

**Platform blog pribadi & portofolio visual modern** yang dibangun dengan Next.js 16, Prisma ORM, MariaDB, dan TailwindCSS v4.

Menampilkan artikel, galeri interaktif bergaya Instagram, story 24 jam, sistem komentar, dan dashboard admin lengkap.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MariaDB](https://img.shields.io/badge/MariaDB-MySQL-003545?style=flat-square&logo=mariadb)](https://mariadb.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://docker.com/)

</div>

---

## ✨ Fitur Utama

### 📝 Blog & Artikel
- Editor Markdown dengan syntax highlighting
- Kategori artikel yang dapat dikelola dari admin
- Visibilitas post: **Public**, **Private**, **Password Protected**
- Status post: **Draft**, **Published**, **Archived**
- Slug otomatis dengan penanganan duplikasi
- Estimasi waktu baca
- Breadcrumb navigasi

### 📸 Galeri Visual (Instagram-Style)
- Grid galeri responsif dengan lightbox interaktif
- Upload gambar & video (auto-convert ke WebP via Sharp)
- Like & komentar per media
- Filter media berdasarkan tipe (Foto / Video)
- Caption per media

### 📖 Story 24 Jam
- Story teks dengan tema gradient warna
- Story foto dengan caption opsional
- Expired otomatis setelah 24 jam
- Story reel di halaman utama
- Republish story dari arsip

### 💬 Interaksi
- Sistem komentar dengan guest support (nama + email)
- Nested replies (komentar bersarang)
- Like post & media (user + guest via cookie token)
- Social share bar (WhatsApp, Twitter/X, Facebook, copy link)

### 🛡️ Admin Dashboard
- Dashboard statistik (Published, Drafts, Users)
- CRUD artikel lengkap
- Manajemen kategori
- Manajemen media & galeri
- Manajemen story (create, archive, republish, delete)
- Manajemen user
- Activity logs & monitoring
- Pengaturan SEO, Google Analytics, & AdSense

### 🔐 Autentikasi & Keamanan
- NextAuth v5 (Auth.js) dengan JWT strategy
- Credentials login dengan password hashing (bcrypt)
- Role-based access: **OWNER** & **GUEST**
- Auto-assign OWNER berdasarkan email di `.env`
- Route protection via `proxy.ts` (Next.js 16 middleware)
- Rate limiting pada API publik
- Upload file validation (MIME type, extension, size limit 50MB)

### 🌐 SEO & Analytics
- Dynamic metadata (title, description, Open Graph, Twitter Cards)
- `sitemap.xml` otomatis dari database
- `robots.txt` dengan AI bot blocking (GPTBot, ClaudeBot, CCBot, dll)
- `X-Robots-Tag` header (`noai, noimageai`)
- RSS feed
- Google Analytics (GA4) support
- Google AdSense support

### 🎨 UI/UX
- Dark mode / Light mode toggle
- Glassmorphism & gradient design
- Responsive design (mobile-first)
- Animasi halus (fade-in, shimmer, hover effects)
- Loading skeleton states
- Error boundary dengan retry
- Custom scrollbar
- Font: Inter (Google Fonts)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| **UI** | [React 19](https://react.dev/) + [TailwindCSS v4](https://tailwindcss.com/) |
| **Database** | [MariaDB](https://mariadb.org/) (MySQL compatible) |
| **ORM** | [Prisma 7](https://www.prisma.io/) dengan MariaDB adapter |
| **Auth** | [NextAuth v5](https://authjs.dev/) (Auth.js) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) (auto WebP conversion) |
| **Logging** | [Pino](https://github.com/pinojs/pino) + Activity Log (database) |
| **Deployment** | [Docker](https://docker.com/) (multi-stage build, standalone output) |

---

## 📁 Struktur Project

```
web2/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (SEO, font, theme)
│   ├── page.tsx                # Homepage (hero, articles, gallery)
│   ├── loading.tsx             # Global loading skeleton
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # Custom 404 page
│   ├── sitemap.ts              # Dynamic sitemap generator
│   ├── robots.ts               # Robots.txt with AI bot blocking
│   ├── globals.css             # Global styles & theme config
│   ├── about/                  # Halaman profil penulis
│   ├── admin/                  # Admin dashboard (protected)
│   │   ├── posts/              # CRUD artikel
│   │   ├── categories/         # Manajemen kategori
│   │   ├── media/              # Manajemen media gallery
│   │   ├── stories/            # Manajemen story
│   │   ├── users/              # Manajemen pengguna
│   │   ├── logs/               # Activity logs
│   │   └── settings/           # Pengaturan site & SEO
│   ├── api/                    # API Routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── comments/           # Komentar API
│   │   ├── likes/              # Like API
│   │   ├── upload/             # File upload API
│   │   ├── admin/              # Admin API (settings)
│   │   └── v1/                 # Public API
│   ├── contact/                # Halaman kontak
│   ├── gallery/                # Galeri visual
│   ├── login/                  # Halaman login
│   ├── post/[slug]/            # Detail artikel (markdown render)
│   ├── posts/                  # Arsip artikel (search, filter, pagination)
│   ├── privacy/                # Kebijakan privasi
│   ├── rss/                    # RSS feed
│   └── terms/                  # Ketentuan layanan
├── components/                 # Reusable React components
├── lib/                        # Utilities & server actions
│   ├── actions/                # Server actions (post, media, story, category, user, log)
│   ├── prisma.ts               # Prisma client singleton
│   ├── logger.ts               # Activity logger
│   ├── rate-limit.ts           # API rate limiter
│   └── cron.ts                 # Scheduled jobs (story cleanup)
├── prisma/
│   ├── schema.prisma           # Database schema (14 models, 5 enums)
│   └── seed.ts                 # Database seeder
├── types/                      # TypeScript type definitions
├── proxy.ts                    # Next.js 16 proxy (middleware replacement)
├── auth.ts                     # NextAuth configuration
├── auth.config.ts              # Auth providers & callbacks
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Docker Compose setup
└── next.config.ts              # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **MariaDB** atau **MySQL** ≥ 10.6
- **npm** ≥ 9.x

### 1. Clone Repository

```bash
git clone https://github.com/kadalio/web2.git
cd web2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/kadalio_db"

# Auth (generate secret: openssl rand -base64 32)
AUTH_SECRET="your-random-secret-here"

# Email owner yang akan mendapat role OWNER secara otomatis
OWNER_EMAIL="your-email@example.com"
AUTH_URL="http://localhost:3000"

# Site URL (untuk sitemap & SEO)
NEXT_PUBLIC_SITE_URL="https://kadalio.com"

# Opsional: Google Analytics & AdSense
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_ADSENSE_ID=""
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# (Opsional) Seed data awal
npx tsx prisma/seed.ts

# (Opsional) Seed akun owner via Credentials login
npx tsx scripts/seed-owner.ts
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🐳 Deployment dengan Docker

### Build & Run

```bash
# Build image
docker build -t kadalio-web .

# Atau gunakan Docker Compose
docker compose up -d --build
```

### Docker Compose

Buat file `.env.production` dengan konfigurasi production Anda, lalu:

```bash
docker compose up -d
```

Aplikasi akan berjalan di `http://localhost:3000` dengan limit resource 512MB RAM & 1 CPU.

> **Catatan**: Database MariaDB harus sudah berjalan terpisah. Gunakan `host.docker.internal` sebagai hostname database jika MariaDB berjalan di host machine.

---

## 📊 Database Schema

Project menggunakan **14 model** dan **5 enum**:

| Model | Deskripsi |
|---|---|
| `User` | Akun pengguna (OWNER / GUEST) |
| `Account` | OAuth accounts (NextAuth adapter) |
| `Session` | Session management |
| `VerificationToken` | Token verifikasi email |
| `Post` | Artikel blog (Markdown) |
| `Story` | Story 24 jam |
| `Category` | Kategori artikel |
| `PostCategory` | Relasi many-to-many Post ↔ Category |
| `Comment` | Komentar pada artikel (nested replies) |
| `Like` | Like pada post & story |
| `Media` | File gambar & video |
| `MediaComment` | Komentar pada media galeri |
| `MediaLike` | Like pada media galeri |
| `ActivityLog` | Log aktivitas (traffic, action, engagement, security) |
| `SiteSetting` | Pengaturan global (SEO, Analytics, AdSense) |

---

## 🔑 Role & Akses

| Fitur | OWNER | GUEST | Visitor (tanpa login) |
|---|:---:|:---:|:---:|
| Baca artikel publik | ✅ | ✅ | ✅ |
| Baca artikel private | ✅ | ❌ | ❌ |
| Like artikel & media | ✅ | ✅ | ✅ (via cookie) |
| Komentar | ✅ | ✅ | ✅ (nama + email) |
| Akses admin dashboard | ✅ | ❌ | ❌ |
| CRUD artikel | ✅ | ❌ | ❌ |
| Upload media | ✅ | ❌ | ❌ |
| Kelola user & settings | ✅ | ❌ | ❌ |

---

## 📜 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npx prisma generate  # Generate Prisma client
npx prisma db push   # Sync schema ke database
npx prisma studio    # Buka Prisma Studio (GUI database)
```

---

## 🛡️ Keamanan

- ✅ Password di-hash menggunakan **bcrypt** (tidak pernah plaintext)
- ✅ Route protection via **proxy.ts** (Next.js 16 proxy/middleware)
- ✅ Server-side auth check di setiap admin layout & server action
- ✅ File upload validation (MIME type whitelist, extension whitelist, 50MB limit)
- ✅ Randomized filename mencegah path traversal & overwrite
- ✅ Rate limiting pada API publik (comments, likes)
- ✅ AI bot blocking via robots.txt & X-Robots-Tag header
- ✅ Input validation & payload length limits

---

## 📄 Lisensi

Project ini bersifat pribadi. Hak cipta © 2024-2026 Kadalio. All rights reserved.
