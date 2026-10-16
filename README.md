# 💰 Catatan Keuangan (Money Management App)

Aplikasi manajemen keuangan modern, budgeting 50/30/20, pelacakan tabungan & investasi, kalender pengingat, dan otomatisasi bulanan yang dibangun dengan **React + TypeScript + Vite**, terintegrasi dengan **Supabase Database & Authentication (dengan Row Level Security)**, dan siap dideploy langsung ke **Vercel**.

---

## 🌟 Fitur Utama

1. **Dashboard & Total Keseluruhan**:
   - Saldo yang aman digunakan (*Usable balance* setelah dikurangi tabungan/aset).
   - Total akumulasi kekayaan bersih (*Net worth*).
   - Ringkasan KPI: Pemasukan, Pengeluaran, Tabungan & Investasi, Sisa Periode.
   - Ringkasan Naratif Otomatis (*Descriptive Insights*) dalam Bahasa Indonesia.
   - Grafik batang komparatif & Donut chart komposisi kategori interaktif.
2. **Navigasi Periode Fleksibel**:
   - Filter Harian, Bulanan, Tahunan, dan Keseluruhan Waktu dengan navigasi tanggal yang mulus.
3. **Target & Anggaran Belanja (Budgeting)**:
   - Batas pengeluaran total bulanan dan pagu per kategori.
   - Fitur **Surplus Carry-Over**: sisa anggaran bulan lalu otomatis ditambahkan ke bulan berikutnya.
   - Ambang batas peringatan dini (50%, 70%, 80%, 90%).
4. **Tabungan, Dana Darurat & Investasi**:
   - Pelacakan rasio tabungan terhadap pemasukan (target ideal ≥ 20%).
   - Pembagian kantong tabungan (*Savings Pockets*) berdasarkan tujuan.
   - Indikator kecukupan dana darurat (target 3–6 bulan pengeluaran).
   - Grafik riwayat konsistensi setoran 12 bulan terakhir.
5. **Kalender Finansial & Pengingat**:
   - Kalender interaktif dengan indikator titik warna (pemasukan, pengeluaran, tabungan, pengingat, transaksi rutin).
   - Pengingat jatuh tempo tagihan dengan checklist status.
   - Otomatisasi transaksi bulanan (*Recurring Rules*) terjadwal otomatis pada tanggal tertentu.
6. **Kesimpulan & Skor Kesehatan Finansial**:
   - Skor kesehatan finansial (0–100) dengan visualisasi *gauge meter*.
   - Evaluasi alokasi formula 50/30/20 (Kebutuhan & Keinginan ≤ 80%, Tabungan ≥ 20%).
   - Rekomendasi pintar & tombol 1-klik **"Terapkan Usulan Anggaran"**.
7. **Penyimpanan Ganda (Hybrid Cloud & Offline)**:
   - **Supabase Cloud**: Sinkronisasi multi-perangkat real-time dengan Row Level Security (RLS).
   - **Mode Lokal (Offline)**: Berfungsi langsung di browser tanpa perlu login, dengan fitur 1-klik migrasi data lokal ke Supabase.

---

## 🚀 Panduan Setup Cepat

### 1. Menjalankan di Lokal

Aplikasi sudah terinstal dependensinya di folder ini:

```bash
# Jalankan development server
npm run dev
```

Buka browser Anda di `http://localhost:3000/`.

---

### 2. Setup Supabase (Database & SQL Editor)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Buka menu **SQL Editor** di sidebar Supabase.
3. Salin seluruh isi file **`supabase/schema.sql`** yang ada di proyek ini.
4. Tempel ke dalam SQL Editor dan klik **Run**.
5. Script tersebut secara otomatis membuat:
   - Tabel `profiles`, `transactions`, `budgets`, `reminders`, `recurring_rules`.
   - Indexing database untuk performa tinggi.
   - Triggers otomatis untuk `updated_at` dan auto-create profil/budget user baru.
   - Row Level Security (RLS) policies agar data tiap pengguna terisolasi aman.

---

### 3. Konfigurasi Environment Variables

Buka file `.env.local` di folder proyek ini (atau buat dari `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Dapatkan kedua nilai tersebut di: **Supabase Dashboard → Project Settings → API**.

---

### 4. Deploy ke Vercel

Proyek ini sudah dilengkapi konfigurasi **`vercel.json`** yang siap deploy:

#### Cara 1: Menggunakan GitHub + Vercel Dashboard (Rekomendasi)
1. Push repositori ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Catatan Keuangan App"
   git branch -M main
   git remote add origin https://github.com/username/catatan-keuangan.git
   git push -u origin main
   ```
2. Buka [Vercel Dashboard](https://vercel.com/dashboard) → Klik **Add New...** → **Project**.
3. Import repositori GitHub Anda. Vercel akan otomatis mendeteksi Framework Preset sebagai **Vite**.
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = URL Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` = Anon Key Supabase Anda
5. Klik **Deploy**! Aplikasi Anda akan aktif dalam hitungan detik.

#### Cara 2: Menggunakan Vercel CLI
```bash
npx vercel
```
Ikuti petunjuk di terminal dan tambahkan environment variable saat diminta.

---

## 📁 Struktur Codebase

```
├── .env.example              # Template variabel lingkungan Supabase
├── .env.local                # File konfigurasi lokal
├── supabase/
│   └── schema.sql            # Script SQL lengkap untuk Supabase SQL Editor
├── src/
│   ├── components/           # Komponen UI modular
│   │   ├── Modals/           # Dialog tambah transaksi, budget, reminder, recurring, auth
│   │   │   ├── AuthModal.tsx
│   │   │   ├── BudgetModal.tsx
│   │   │   ├── RecurringModal.tsx
│   │   │   ├── ReminderModal.tsx
│   │   │   └── TransactionModal.tsx
│   │   ├── BalanceOverview.tsx
│   │   ├── BarChart.tsx
│   │   ├── BudgetTracker.tsx
│   │   ├── CalendarView.tsx
│   │   ├── DescriptiveResume.tsx
│   │   ├── FinancialHealthView.tsx
│   │   ├── Header.tsx
│   │   ├── PeriodNavigator.tsx
│   │   ├── PieChart.tsx
│   │   ├── SavingsView.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── Toast.tsx
│   │   └── TransactionList.tsx
│   ├── context/
│   │   ├── AuthContext.tsx    # Manajemen autentikasi Supabase & Guest mode
│   │   └── FinanceContext.tsx # Manajemen state transaksi, budget, sinkronisasi Supabase
│   ├── lib/
│   │   └── supabase.ts       # Inisialisasi Supabase client & deteksi status
│   ├── types/
│   │   ├── database.ts       # Definisi skema tabel PostgreSQL Supabase
│   │   └── index.ts          # Tipe domain & antarmuka aplikasi
│   ├── utils/
│   │   ├── calculations.ts   # Mesin perhitungan finansial, surplus, 50/30/20, health score
│   │   └── formatters.ts     # Format mata uang Rupiah, tanggal lokal, preset
│   ├── App.tsx               # Orchestrator tata letak & navigasi
│   ├── index.css             # Desain sistem dark glassmorphism modern
│   ├── main.tsx              # Entry point React
│   └── vite-env.d.ts         # Type definitions Vite
├── index.html                # Entry point HTML dengan font Plus Jakarta Sans & JetBrains Mono
├── package.json              # Dependensi dan script build
├── tsconfig.json             # Konfigurasi TypeScript
├── vercel.json               # Konfigurasi routing SPA untuk Vercel
└── vite.config.ts            # Konfigurasi Vite bundler
```
