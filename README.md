# Aura Store — Sistem Rekap Keuangan

Web app full-stack (Next.js + PostgreSQL) untuk mencatat transaksi order skin Minecraft
dan menghitung komisi otomatis: Worker, Admin CS, Kas Perusahaan, dan Owner.

## Fitur

- **Login** (username & password, tersimpan di database, password di-hash)
- **Isi Transaksi**: Hari/Tanggal, Waktu, Admin, Worker, Jenis Orderan, Harga, Varian Resolusi
- **Komisi otomatis**:
  - Worker: Junior 30% / Senior 40% / Master 50% (dipilih saat menambah worker)
  - Admin CS: 10% tetap
  - Kas Perusahaan: 10% tetap
  - Owner: sisa pendapatan
- **Rekap**: tabel semua transaksi, filter tanggal & pencarian, total pendapatan
- **Manajemen Worker**: tambah worker + atur tingkatan
- **Manajemen Admin CS**: tambah staff admin/CS
- **Manajemen Produk**: tambah jenis orderan baru kapan saja (termasuk produk non-skin nanti),
  bisa matikan opsi "varian resolusi" untuk produk yang tidak butuh
- **Manajemen Pengguna** (khusus role Owner): tambah akun login baru

## Struktur Komisi

Persentase diatur di `src/lib/commission.ts`:

```ts
WORKER_PERCENT = { JUNIOR: 30, SENIOR: 40, MASTER: 50 }
ADMIN_CS_PERCENT = 10
KAS_PERUSAHAAN_PERCENT = 10
// Owner = harga - workerAmount - adminAmount - kasAmount
```

Kalau nanti persentase berubah, cukup edit angka di file ini — tidak akan mengubah
transaksi lama karena setiap transaksi menyimpan "snapshot" persen & nominal komisi
pada saat itu (jadi riwayat tetap akurat walau tier worker atau persentase berubah).

## Cara Deploy (Vercel + database gratis)

### 1. Siapkan database PostgreSQL gratis

Pilih salah satu (semua kompatibel, tinggal pilih yang paling gampang):

- **Vercel Postgres** (paling gampang karena satu ekosistem dengan Vercel):
  Buka project di Vercel → tab **Storage** → **Create Database** → Postgres.
- **Neon** (https://neon.tech) — gratis, populer untuk Next.js.
- **Supabase** (https://supabase.com) — gratis, ada dashboard tambahan.

Setelah dibuat, salin **connection string**-nya (format `postgresql://...`).

### 2. Push project ini ke GitHub

```bash
cd aura-store
git init
git add .
git commit -m "Initial commit - Aura Store"
```

Buat repo baru di GitHub, lalu:

```bash
git remote add origin https://github.com/USERNAME/aura-store.git
git branch -M main
git push -u origin main
```

### 3. Import ke Vercel

1. Buka https://vercel.com/new, pilih repo GitHub tadi.
2. Sebelum klik Deploy, buka **Environment Variables** dan isi:
   - `DATABASE_URL` → connection string dari langkah 1
   - `NEXTAUTH_SECRET` → generate random string, misal jalankan `openssl rand -base64 32` di terminal
   - `NEXTAUTH_URL` → isi nanti setelah tahu domain Vercel-nya, contoh `https://aura-store.vercel.app`
     (setelah deploy pertama kali, update env ini lalu redeploy)
3. Klik **Deploy**.

### 4. Migrasi & isi data awal database

Setelah `DATABASE_URL` terpasang, jalankan dari komputer lokal (dengan `.env` berisi
`DATABASE_URL` yang sama):

```bash
npm install
npx prisma migrate deploy   # bikin semua tabel di database
npm run seed                # bikin akun login default + 4 produk default
```

Kalau belum pernah bikin migration sama sekali (folder `prisma/migrations` masih kosong),
jalankan ini dulu sekali di lokal untuk generate migration awalnya:

```bash
npx prisma migrate dev --name init
```

lalu commit & push folder `prisma/migrations` yang baru muncul, baru deploy ulang.

### 5. Login pertama kali

- Username: `owner`
- Password: `aurastore123`

**Segera ganti** — buka menu **Pengguna** setelah login, tambah akun baru dengan
password sendiri (fitur ganti password akun `owner` bawaan belum ada di versi ini;
cara paling gampang: buat user baru dengan role Owner, lalu berhenti pakai akun `owner` lama).

### 6. Tambah data awal

Sebelum bisa mengisi transaksi, tambahkan dulu minimal satu data di:
- **Admin CS** (nama staff yang menangani orderan)
- **Worker** (nama skin artist + tingkatan)
- **Produk** (4 produk default sudah otomatis dibuat oleh seed: Kostum Skin, Head Only, Vault Only, Couple Skin)

## Development lokal

```bash
npm install
cp .env.example .env    # lalu isi DATABASE_URL dengan database lokal/cloud
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Buka http://localhost:3000

## Menambah produk baru di luar skin (rencana ke depan)

Tinggal buka menu **Produk** → isi nama produk baru → matikan centang "Punya varian
resolusi" kalau produknya bukan skin. Tidak perlu ubah kode sama sekali.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- NextAuth.js (Credentials provider, JWT session)
- Tailwind CSS
