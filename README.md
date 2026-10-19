# 🐾 MeongID

Aplikasi manajemen hewan peliharaan harian yang imut, fungsional, dan siap dikembangkan. MeongID membantu *pet parents* mengelola kebutuhan hewan kesayangan: profil terpadu, pengingat pintar, paspor QR darurat, catatan pengeluaran, dan jurnal tumbuh kembang.

## ✨ Fitur v1

1. **Profil Hewan Terpadu** — data dasar (nama, spesies/ras, tanggal lahir, jenis kelamin), data fisik & medis (berat, golongan darah, alergi, nomor cip/stambuk), foto profil.
2. **Pengingat Pintar** — vaksinasi, obat cacing/kutu, grooming; mendukung pengulangan berkala (mingguan/bulanan/tahunan) yang otomatis maju ke siklus berikutnya saat ditandai beres, plus penanda "Terlambat".
3. **Digital Pet Passport (QR)** — halaman publik `/passport/:token` berisi identitas hewan, riwayat alergi, catatan darurat, dan kontak pemilik (telepon/WA) — bisa dibuka tanpa login saat hewan ditemukan.
4. **Pet Expense Tracker** — pencatatan pengeluaran per kategori (makanan, pasir/perlengkapan, medis/vaksin, grooming, lainnya) dengan rekapitulasi per bulan dan grafik per kategori.
5. **Jurnal Tumbuh Kembang & Galeri** — grafik tren berat badan (SVG, tanpa dependensi chart) dan galeri foto per hewan.

**Freemium (sesuai strategi bisnis):** paket Gratis maksimal 2 hewan; Premium (simulasi demo di halaman Pengaturan, tanpa payment gateway) membuka hewan tanpa batas.

**PWA (mobile & desktop):** MeongID bisa dipasang sebagai aplikasi di Android, iOS (Safari → Tambah ke Layar Utama), dan Chrome/Edge desktop — layar penuh tanpa browser, ikon sendiri, shortcut cepat (Pengingat & Pengeluaran), plus app-shell offline dasar lewat service worker. Tombol "Pasang aplikasi" tersedia di halaman Pengaturan.

## 🎨 Design System

- **Vibe:** *Cute yet Clean* — palet pastel hangat (soft peach `#FFDCC9`, warm cream, dusty rose, soft lavender, mint) dengan latar off-white.
- **Tipografi:** heading Fredoka (membulat), body Inter ≥ 15.5px.
- **Aksesibilitas:** bottom navigation *thumb-friendly*, target sentuh ≥ 48×48 px, kontras teks aman, `aria-label` pada aksi ikon, animasi halus (framer-motion).
- Maskot emoji + *copywriting* hangat di setiap *empty state*.

## 🧱 Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS + framer-motion + lucide-react + qrcode.react |
| Backend | Node.js + Express + express-validator + JWT (bcryptjs) + multer (upload foto) |
| Database | PostgreSQL 16 (SQL migration murni, tanpa ORM) |
| Infrastruktur | Docker & Docker Compose (db + backend + frontend nginx) |

Arsitektur modular: `db/` (migrasi & seed), `backend/` (REST API), `frontend/` (SPA). API satu origin — nginx mem-proxy `/api` dan `/uploads` ke backend, sehingga aman dipakai lewat tunnel HTTPS (ngrok) tanpa ubah konfigurasi.

## 🚀 Menjalankan

```bash
docker compose up -d --build
```

- Aplikasi: <http://localhost:5173>
- API: <http://localhost:3001> (health: `/health`)
- PostgreSQL: `localhost:5434`

Migrasi + seed otomatis berjalan saat container backend start.

**Akun demo:** `demo@meong.test` / `meong123` (ada tombol isi otomatis di halaman masuk) berisi Mochi 🐱 lengkap dengan pengingat, pengeluaran, dan 6 catatan berat.

### Pengembangan lokal (tanpa Docker)

```bash
# 1) Database
docker compose up -d db

# 2) Backend (butuh DATABASE_URL, lihat .env.example)
cd backend && cp ../.env.example .env   # sesuaikan DATABASE_URL ke localhost:5434
npm install && npm run migrate && npm run seed && npm run dev

# 3) Frontend (proxy /api & /uploads otomatis ke localhost:3001)
cd frontend && npm install && npm run dev
```

## 📁 Struktur

```
db/migrations/        # 001 users → 006 gallery (raw SQL, idempoten)
db/ (tanpa seeds SQL — seed via backend/src/seed.js)
backend/src/
  config/             # koneksi pg + runner migrasi
  middleware/         # auth JWT + upload multer
  routes/             # auth, pets, reminders, expenses, dashboard, passport
  seed.js             # akun demo idempoten
frontend/src/
  api/client.js       # axios + helper fileUrl/rupiah/pesanError
  components/         # UI kit (card, modal, bottom nav, grafik berat, form)
  pages/              # beranda, hewan, detail (4 tab), pengingat, pengeluaran, pengaturan, paspor
  data/kategori.js    # enum bersama (kategori, jenis, spesies)
  utils/format.js     # rupiah, tanggal Indonesia, usia, label jadwal
```

## 🔌 Ringkasan API

| Endpoint | Keterangan |
| --- | --- |
| `POST /api/auth/register` · `POST /api/auth/login` · `GET/PUT /api/auth/me` | Akun & profil pemilik |
| `POST /api/auth/upgrade` · `POST /api/auth/downgrade` | Simulasi paket freemium (demo) |
| `GET/POST /api/pets` · `GET/PUT/DELETE /api/pets/:id` | Profil hewan (+ batas paket gratis) |
| `POST /api/pets/:id/foto` | Foto profil (multipart, maks 5 MB) |
| `GET/POST /api/pets/:id/weights` · `DELETE .../weights/:wid` | Jurnal berat (otomatis refresh berat profil) |
| `GET/POST /api/pets/:id/galeri` · `DELETE .../galeri/:gid` | Galeri foto |
| `GET/POST /api/reminders` · `PUT/DELETE /api/reminders/:id` · `POST /api/reminders/:id/selesai` | Pengingat + pengulangan berkala |
| `GET/POST /api/expenses` · `DELETE /api/expenses/:id` | Pengeluaran + rekapitulasi per kategori/bulan |
| `GET /api/dashboard` | Ringkasan Beranda |
| `GET /api/passport/:token` | **Publik** — paspor QR hewan |

Semua endpoint selain auth & passport membutuhkan header `Authorization: Bearer <token>`, dan setiap query difilter `user_id` (isolasi antar akun).

## ⚙️ Konfigurasi

Salin `.env.example` → `.env` bila ingin mengubah default (kredensial DB, `JWT_SECRET`, akun demo, `VITE_API_URL`). Untuk deployment di host terpisah, isi `VITE_API_URL` dengan URL absolut API.
