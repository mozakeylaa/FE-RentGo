# 🚗 RentGo Frontend — Dokumentasi Lengkap

> **Proyek Ujian Kenaikan Level | SMK RPL — Frontend Developer**

---

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)

---

## Daftar Isi

1. [README & Overview Proyek](#bagian-1--readme--overview-proyek)
2. [Arsitektur & Struktur Proyek](#bagian-2--arsitektur--struktur-proyek)
3. [Slicing Design (UI Implementation)](#bagian-3--slicing-design-ui-implementation)
4. [Autentikasi & Manajemen Token](#bagian-4--autentikasi--manajemen-token)
5. [Otorisasi & Protected Routes](#bagian-5--otorisasi--protected-routes)
6. [CRUD Interface & Visualisasi Data](#bagian-6--crud-interface--visualisasi-data)
7. [Manajemen Transaksi & Feedback UI](#bagian-7--manajemen-transaksi--feedback-ui)
8. [Integrasi API Backend](#bagian-8--integrasi-api-backend)
9. [Responsivitas & UI/UX](#bagian-9--responsivitas--uiux)
10. [Bahan Presentasi & Tanya Jawab](#bagian-10--bahan-presentasi--tanya-jawab)

---

# BAGIAN 1 — README & OVERVIEW PROYEK

## Nama & Deskripsi Proyek

**RentGo Frontend** adalah antarmuka web berbasis Next.js untuk platform sewa kendaraan RentGo. Frontend ini mengonsumsi REST API NestJS dari backend untuk menampilkan daftar kendaraan, memproses pemesanan, mengelola pembayaran, dan menyediakan panel admin yang lengkap.

**Tujuan Proyek:**
- Membangun UI modern, responsif, dan ramah pengguna menggunakan Next.js App Router
- Mengimplementasikan autentikasi berbasis JWT dengan manajemen token di localStorage
- Menerapkan RBAC di sisi frontend (tampilkan/sembunyikan elemen berdasarkan role)
- Mengintegrasikan semua endpoint backend ke dalam antarmuka yang intuitif
- Deploy ke Vercel dengan konfigurasi environment variable produksi

---

## Fitur Utama

| Fitur | Keterangan |
|---|---|
| Autentikasi JWT | Login, Register, Logout, Restore sesi otomatis dari localStorage |
| Protected Route | Komponen `ProtectedRoute` + `RoleGate` melindungi halaman berdasarkan login/role |
| CRUD Kendaraan | Admin dapat tambah, edit, hapus kendaraan + kelola galeri foto |
| Sistem Sewa | User dapat melihat kendaraan, pilih tanggal, dan buat pesanan |
| Sistem Pembayaran | Pilih metode (Transfer/QRIS), upload bukti, lihat status konfirmasi |
| Halaman Invoice | Lihat, cetak, dan download invoice setelah pembayaran lunas |
| Review & Rating | User dapat memberikan rating bintang + komentar setelah sewa selesai |
| Dashboard Admin | Statistik real-time dengan grafik Recharts (bar chart per bulan) |
| Responsif Mobile | Tampilan berubah dari tabel ke kartu di layar kecil |
| Dark Theme | Seluruh UI menggunakan tema gelap `#080f1a` dengan aksen hijau `#4ade80` |
| Toast Notification | Feedback sukses/error menggunakan react-hot-toast |
| Skeleton Loading | Animasi skeleton saat data sedang diambil dari API |
| Filter & Pagination | Filter tipe/status kendaraan + pagination dengan tombol halaman |

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Next.js | 16.2.6 | Framework React dengan App Router, SSR, routing berbasis folder |
| TypeScript | ^5 | Bahasa pemrograman dengan type-safety |
| Tailwind CSS | ^4 | Utility-first CSS framework untuk styling |
| Axios | ^1.16.1 | HTTP client untuk request API dengan interceptor |
| React Hook Form | ^7.76.0 | Manajemen form yang efisien (register, login, vehicle form) |
| Zod | ^4.4.3 | Validasi schema form yang terintegrasi dengan React Hook Form |
| react-hot-toast | ^2.6.0 | Notifikasi toast (sukses, error, loading) |
| Recharts | ^3.8.1 | Library chart untuk visualisasi data di dashboard admin |
| Lucide React | ^1.16.0 | Icon library yang konsisten |
| date-fns | ^4.3.0 | Utilitas manipulasi tanggal |

---

## Cara Setup Lokal

**1. Clone repository**
```bash
git clone https://github.com/[USERNAME]/rentgo-frontend.git
cd rentgo-frontend
```

**2. Install dependensi**
```bash
npm install
```

**3. Buat file `.env.local`** di root folder:

```env
# URL API Backend (Railway / lokal)
NEXT_PUBLIC_API_URL=https://rent-go-production.up.railway.app

# Untuk development lokal, ganti dengan:
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

**4. Jalankan development server**
```bash
npm run dev
```

**5. Akses aplikasi**

Buka `http://localhost:3001` di browser (Next.js default port 3000, jika backend sudah pakai 3000 maka Next.js akan pakai 3001 otomatis).

---

## Akun Default (dari seed backend)

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@rentgo.com | Admin123! |
| USER | user1@mail.com | User123! |

---

## Link Akses Produksi

| Lingkungan | URL |
|---|---|
| Frontend (Vercel) | `[ISI SESUAI PROYEKMU — contoh: https://rentgo.vercel.app]` |
| API Backend (Railway) | `[ISI SESUAI PROYEKMU — contoh: https://rent-go.up.railway.app]` |

---

# BAGIAN 2 — ARSITEKTUR & STRUKTUR PROYEK

## Diagram Alur Aplikasi

```
┌─────────────────────────────────────────────────────────────┐
│                          USER                               │
│              (Browser — buka rentgo.vercel.app)             │
└────────────────────────┬────────────────────────────────────┘
                         │ Navigasi ke URL
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router                        │
│         app/(public)/ , app/(auth)/ , app/(admin)/          │
│         app/(user)/                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ Render halaman
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  ProtectedRoute + RoleGate                  │
│   Cek token di localStorage → redirect /login jika tidak ada│
│   Cek role user → redirect / jika role tidak sesuai         │
└────────────────────────┬────────────────────────────────────┘
                         │ Lolos validasi
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Component                          │
│    Render UI dengan data dari AuthContext + API             │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch data (useEffect / event handler)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Axios Instance (lib/axios.ts)               │
│   Interceptor request: tempel Bearer token otomatis         │
│   Interceptor response: handle 401 → redirect /login        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NestJS Backend API (Railway)                    │
│         https://rent-go.up.railway.app/...                  │
└────────────────────────┬────────────────────────────────────┘
                         │ JSON Response
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React State                              │
│    useState → update UI dengan data terbaru                 │
│    Toast notification → feedback ke user                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Penjelasan Setiap Folder Utama

| Folder | Isi | Fungsi |
|---|---|---|
| `app/` | Page files (App Router) | Routing berbasis struktur folder. Setiap `page.tsx` = satu halaman yang bisa diakses |
| `app/(public)/` | Halaman yang bisa diakses tanpa login | Home, vehicles, about, search, detail kendaraan |
| `app/(auth)/` | Halaman autentikasi | Login, Register |
| `app/(admin)/` | Halaman khusus ADMIN | Dashboard, kelola kendaraan, pesanan, pembayaran, invoice, review, user |
| `app/(user)/` | Halaman khusus USER yang login | Sewa saya, pembayaran, invoice, profil |
| `components/` | Komponen UI yang dipakai ulang | Navbar, Footer, VehicleCard, ProtectedRoute, RoleGate, ReviewForm, dll |
| `lib/` | Utilitas & helper | `axios.ts` (HTTP client), `api.ts` (semua API call), `auth.ts` (helper token), `format.ts`, `utils.ts` |
| `context/` | React Context API | `AuthContext.tsx` — state global user, token, login, logout |
| `hooks/` | Custom React hooks | `useAuth.ts` — alternatif hook untuk akses state auth |
| `types/` | TypeScript types & interfaces | `index.ts` — tipe data User, Vehicle, Rental, Payment, dll |

---

## Struktur Folder Proyek

```
rentgo-frontend/
├── app/
│   ├── layout.tsx              # Root layout (metadata, font, Providers wrapper)
│   ├── providers.tsx           # Wrapper global: AuthProvider + Navbar + Footer + Toaster
│   ├── globals.css             # Global styles + custom utility classes Tailwind
│   │
│   ├── (public)/               # Route group: tidak perlu login
│   │   ├── page.tsx            # Halaman Home (hero, search, daftar kendaraan)
│   │   ├── about/page.tsx      # Halaman Tentang Kami
│   │   ├── search/page.tsx     # Halaman hasil pencarian
│   │   └── vehicles/
│   │       ├── page.tsx        # Daftar semua kendaraan
│   │       └── [id]/page.tsx   # Detail kendaraan + form sewa
│   │
│   ├── (auth)/                 # Route group: halaman autentikasi
│   │   ├── login/
│   │   │   ├── layout.tsx      # Metadata halaman login
│   │   │   └── page.tsx        # Form login (email + password)
│   │   └── register/
│   │       ├── layout.tsx      # Metadata halaman register
│   │       └── page.tsx        # Form register (name, email, password, phone)
│   │
│   ├── (admin)/                # Route group: khusus ADMIN
│   │   ├── layout.tsx          # Wrapper: ProtectedRoute + RoleGate(['ADMIN'])
│   │   └── admin/
│   │       ├── layout.tsx      # Layout tambahan admin
│   │       ├── page.tsx        # Dashboard admin (statistik + chart)
│   │       ├── vehicles/page.tsx    # Kelola kendaraan (CRUD + galeri)
│   │       ├── rentals/page.tsx     # Kelola pesanan (ubah status + selesaikan)
│   │       ├── payments/page.tsx    # Kelola pembayaran (konfirmasi/tolak bukti)
│   │       ├── invoices/page.tsx    # Kelola invoice (generate ulang)
│   │       ├── reviews/page.tsx     # Kelola review (hapus)
│   │       └── users/page.tsx       # Kelola pengguna (hapus)
│   │
│   └── (user)/                 # Route group: user yang sudah login
│       ├── layout.tsx          # Wrapper: ProtectedRoute
│       ├── my-rentals/
│       │   ├── layout.tsx
│       │   └── page.tsx        # Riwayat sewa + batalkan + beri review
│       ├── payment/[rentalId]/
│       │   ├── layout.tsx
│       │   └── page.tsx        # Halaman pembayaran + upload bukti
│       ├── invoice/[rentalId]/
│       │   ├── layout.tsx
│       │   └── page.tsx        # Tampilan + download invoice
│       └── profile/
│           └── page.tsx        # Edit profil + ganti foto
│
├── components/
│   ├── Navbar.tsx              # Navigasi atas (responsive, berbeda per role)
│   ├── Footer.tsx              # Footer dengan info kontak & link
│   ├── ProtectedRoute.tsx      # Guard: redirect /login jika belum auth
│   ├── RoleGate.tsx            # Guard: redirect / jika role tidak sesuai
│   ├── VehicleCard.tsx         # Kartu kendaraan dengan slideshow foto
│   ├── VehicleForm.tsx         # Form tambah/edit kendaraan (modal)
│   ├── ReviewForm.tsx          # Form beri review (bintang + komentar)
│   ├── ReviewList.tsx          # Daftar review kendaraan dengan rata-rata rating
│   ├── CitySelector.tsx        # Dropdown pilih kota dengan search (portal)
│   ├── Loader.tsx              # Spinner loading
│   ├── EmptyState.tsx          # Tampilan saat data kosong
│   ├── SkeletonCard.tsx        # Skeleton loading kartu kendaraan
│   ├── SkeletonTable.tsx       # Skeleton loading tabel
│   └── FormInput.tsx           # Input field yang dapat dipakai ulang
│
├── context/
│   └── AuthContext.tsx         # Global state: user, token, login, logout, isAdmin
│
├── hooks/
│   └── useAuth.ts              # Custom hook alternatif untuk akses auth state
│
├── lib/
│   ├── axios.ts                # Axios instance + interceptor request/response
│   ├── api.ts                  # Semua fungsi API call (authApi, vehicleApi, dll)
│   ├── auth.ts                 # Helper: simpan/ambil token dari localStorage
│   ├── format.ts               # formatRupiah, formatDate
│   └── utils.ts                # Utilitas lain: calculateDays, status config
│
├── types/
│   └── index.ts                # TypeScript types: User, Vehicle, Rental, Payment, dll
│
├── public/
│   └── images/                 # Gambar statis (foto developer, dll)
│
├── .env.local                  # Environment variables (tidak di-commit)
├── next.config.ts              # Konfigurasi Next.js (remote image patterns)
├── tailwind.config.ts          # Konfigurasi Tailwind (warna, font, shadow)
├── tsconfig.json
└── package.json
```

---

## Pilihan App Router

Proyek ini menggunakan **App Router** (bukan Pages Router) karena:

**Keunggulan App Router yang digunakan di proyek ini:**

Struktur route group `(public)`, `(auth)`, `(admin)`, `(user)` memungkinkan pengelompokan halaman dengan layout berbeda tanpa memengaruhi URL. Misalnya `app/(admin)/admin/page.tsx` diakses di `/admin`, bukan `/admin/admin`.

Setiap grup bisa punya `layout.tsx` sendiri, sehingga wrapper `ProtectedRoute` dan `RoleGate` cukup ditulis sekali di level layout, bukan di setiap halaman. Semua komponen menggunakan `'use client'` karena memerlukan interaktivitas dan state.

---

# BAGIAN 3 — SLICING DESIGN (UI IMPLEMENTATION)

## Pendekatan Slicing

Proyek ini menggunakan pendekatan **dark glassmorphism** dengan palet warna:
- Background utama: `#080f1a` (biru gelap hampir hitam)
- Aksen hijau: `#4ade80` (emerald/neon green)
- Permukaan card: `bg-white/[0.04]` dengan `border border-white/10`
- Teks utama: `text-white`, teks sekunder: `text-white/40`

Tailwind digunakan sepenuhnya untuk styling. Tidak ada file CSS terpisah per komponen — semua ditulis sebagai className utility classes langsung di JSX.

Kelas utility kustom (`.btn-primary`, `.card`, `.badge-green`, dll) didefinisikan di `globals.css` menggunakan `@layer components` sehingga bisa dipanggil di mana saja tanpa import.

---

## Daftar Semua Halaman

| Nama Halaman | Path/Route | Deskripsi | Auth Required |
|---|---|---|---|
| Home | `/` | Hero + search kendaraan + daftar kendaraan tersedia + kategori + cara sewa | Tidak |
| Semua Kendaraan | `/vehicles` | Grid kendaraan dengan search + filter tipe + pagination | Tidak |
| Detail Kendaraan | `/vehicles/[id]` | Foto utama + galeri, spesifikasi, review, form sewa dengan estimasi harga | Tidak |
| Hasil Pencarian | `/search` | Halaman hasil pencarian dari hero home | Tidak |
| Tentang Kami | `/about` | Visi misi, statistik, keunggulan, tim developer, kontak, CTA | Tidak |
| Login | `/login` | Form login email + password dengan validasi Zod | Tidak |
| Register | `/register` | Form register nama, email, password, telepon | Tidak |
| Sewa Saya | `/my-rentals` | Riwayat sewa, status, tombol bayar/batalkan/beri review | Ya (USER) |
| Pembayaran | `/payment/[rentalId]` | Pilih metode bayar, info rekening/QRIS, upload bukti | Ya (USER) |
| Invoice | `/invoice/[rentalId]` | Tampilan invoice, cetak, download HTML | Ya (USER) |
| Profil | `/profile` | Edit nama, telepon, ganti foto profil | Ya (USER) |
| Admin Dashboard | `/admin` | Statistik 4 kartu + pesanan terbaru + bar chart bulanan + edit profil admin | Ya (ADMIN) |
| Admin Kendaraan | `/admin/vehicles` | Tabel kendaraan + CRUD + galeri foto | Ya (ADMIN) |
| Admin Pesanan | `/admin/rentals` | Tabel pesanan + ubah status + selesaikan + lihat/konfirmasi bukti | Ya (ADMIN) |
| Admin Pembayaran | `/admin/payments` | Tabel pembayaran + filter status + konfirmasi/tolak bukti | Ya (ADMIN) |
| Admin Invoice | `/admin/invoices` | Tabel invoice + generate ulang | Ya (ADMIN) |
| Admin Review | `/admin/reviews` | Tabel review + rating summary + hapus | Ya (ADMIN) |
| Admin Pengguna | `/admin/users` | Tabel pengguna + statistik role + hapus | Ya (ADMIN) |

---

## Daftar Komponen UI

| Nama Komponen | Props Utama | Kegunaan |
|---|---|---|
| `Navbar` | — (pakai `useAuth`) | Navigasi atas sticky, hamburger menu mobile, berbeda berdasarkan role |
| `Footer` | — | Footer dengan brand, link, kontak, sosial media |
| `ProtectedRoute` | `children` | Redirect ke `/login` jika belum auth |
| `RoleGate` | `allow: Role[]`, `children` | Redirect ke `/` jika role tidak ada di `allow` |
| `VehicleCard` | `vehicle`, `startDate?`, `endDate?` | Kartu kendaraan dengan slideshow foto otomatis saat hover |
| `VehicleForm` | `initial?`, `onSubmit`, `onClose`, `submitting` | Modal form tambah/edit kendaraan dengan upload foto |
| `CitySelector` | `value`, `onChange`, `dark?` | Dropdown pilih kota dengan search, menggunakan React portal |
| `ReviewForm` | `rentalId`, `onSuccess?` | Form rating bintang + textarea komentar |
| `ReviewList` | `vehicleId` | Daftar review kendaraan + rata-rata rating |
| `Loader` | `text?` | Spinner animasi dengan teks opsional |
| `EmptyState` | `title?`, `description?` | Tampilan saat data kosong (ikon + teks) |
| `SkeletonCard` | — | Placeholder animasi kartu kendaraan saat loading |
| `SkeletonTable` | `rows?`, `cols?` | Placeholder animasi tabel saat loading |
| `FormInput` | `label`, `error?`, + semua HTML input props | Input field dengan label dan pesan error |

---

## Konvensi Tailwind yang Digunakan

**Pola nama kelas kustom (`globals.css`):**

```css
/* Tombol — konsisten di seluruh proyek */
.btn-primary  → bg-primary-600 + white text + rounded-xl
.btn-secondary → bg-white + border + slate text + rounded-xl
.btn-danger   → bg-red-600 + white text + rounded-xl

/* Form */
.input-field  → border-slate-200 + rounded-xl + focus:ring-primary-500
.label        → text-sm font-medium text-slate-700
.error-msg    → text-xs text-red-500

/* Card */
.card         → bg-white rounded-2xl border-slate-100 shadow-card p-6
.card-hover   → .card + hover:shadow-soft hover:border-primary-200

/* Badge status */
.badge-green  → bg-emerald-100 text-emerald-700
.badge-yellow → bg-amber-100 text-amber-700
.badge-red    → bg-red-100 text-red-700
.badge-blue   → bg-blue-100 text-blue-700
.badge-gray   → bg-slate-100 text-slate-600
```

**Pola warna dark mode (dipakai langsung):**
```
bg-[#080f1a]        → Background utama
bg-white/[0.04]     → Surface card gelap
border-white/10     → Border halus
text-white/40       → Teks sekunder
text-[#4ade80]      → Aksen hijau
bg-[#4ade80]/10     → Latar aksen transparan
```

---

## Implementasi Tema

Proyek menggunakan tema **gelap tunggal** (tidak ada toggle dark/light). Warna didefinisikan langsung sebagai hex/opacity di className karena lebih konsisten dan mudah diprediksi. Font utama adalah **Plus Jakarta Sans** (di-import dari Google Fonts di `globals.css`) dan **Space Grotesk** (di-load lewat `next/font/google` di `layout.tsx`).

---

# BAGIAN 4 — AUTENTIKASI & MANAJEMEN TOKEN

## Alur Autentikasi Lengkap

### Login
```
User isi form login (email + password)
  │ Validasi Zod di frontend (format email, min 6 char)
  ▼
POST /auth/login ke API Backend
  │ Header: Content-Type: application/json
  │ Body: { email, password }
  ▼
Response dari backend:
  ├── Sukses → { accessToken, user: { id, name, email, role } }
  │     ├── Simpan accessToken ke localStorage['rentgo_token']
  │     ├── Simpan user ke localStorage['rentgo_user']
  │     ├── Update AuthContext: setToken(), setUser()
  │     ├── Toast: "Selamat datang, {nama}!"
  │     └── Redirect: ADMIN → /admin | USER → /
  └── Gagal → Toast error pesan dari API (401: "Email atau password salah")

Setiap request selanjutnya:
  │ Axios interceptor otomatis tempel header:
  │ Authorization: Bearer <token dari localStorage>
  ▼
Logout:
  ├── Hapus localStorage['rentgo_token']
  ├── Hapus localStorage['rentgo_user']
  ├── Reset state: setToken(null), setUser(null)
  ├── Toast: "Berhasil logout"
  └── Redirect ke /login
```

### Restore Sesi Saat Halaman Dibuka Ulang
```
App mount (AuthProvider useEffect)
  ├── Cek localStorage['rentgo_token']
  ├── Jika tidak ada → setLoading(false) → selesai
  └── Jika ada → GET /auth/me dengan token di header
        ├── Sukses → setUser(data) → sesi terpulihkan
        └── Gagal (token invalid/expired) → hapus localStorage
              → setToken(null), setUser(null) → redirect /login
```

---

## Cara Menyimpan Token: localStorage

Proyek ini menyimpan JWT token di **localStorage** dengan key `rentgo_token`. Alasannya:

Untuk proyek ini, localStorage dipilih karena kemudahannya — tidak memerlukan konfigurasi server untuk httpOnly cookie. Nilainya dapat dibaca JavaScript, sehingga Axios interceptor bisa mengambilnya secara otomatis di setiap request.

Kekurangan localStorage (rentan XSS) dimitigasi dengan tidak menyimpan data sensitif selain token, dan menggunakan Axios interceptor response untuk segera menghapus token saat server merespons 401.

---

## Cara Mengirim Token di Setiap Request

Token dikirim otomatis oleh **Axios request interceptor** di `lib/axios.ts`:

```typescript
// lib/axios.ts

// Axios instance dengan base URL dari environment variable
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// REQUEST interceptor — otomatis tempel token di setiap request
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Ambil token dari localStorage setiap request
    const token = localStorage.getItem('rentgo_token')
    if (token) {
      // Tempel sebagai Bearer token di header Authorization
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// RESPONSE interceptor — tangani 401 secara global
axiosInstance.interceptors.response.use(
  (response) => response,   // Response sukses, teruskan apa adanya
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Token expired atau tidak valid — bersihkan semua
        localStorage.removeItem('rentgo_token')
        localStorage.removeItem('rentgo_user')
        toast.error('Sesi berakhir, silakan login lagi')
        window.location.href = '/login'   // Hard redirect
      }
    }
    return Promise.reject(error)
  }
)
```

Karena semua API call menggunakan `axiosInstance` ini, tidak ada satu pun komponen yang perlu mengatur token secara manual.

---

## Form Login & Register

### Detail Validasi dengan Zod

```typescript
// Skema validasi login (app/(auth)/login/page.tsx)
const loginSchema = z.object({
  email:    z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

// Skema validasi register (app/(auth)/register/page.tsx)
const registerSchema = z.object({
  name:     z.string().min(3, 'Nama minimal 3 karakter'),
  email:    z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone:    z.string().optional(),   // Nomor HP tidak wajib
})
```

### Loading State Saat Submit

```typescript
// Contoh pattern loading state di form login
const [isSubmitting, setIsSubmitting] = useState(false)

const onSubmit = async (data: LoginForm) => {
  setIsSubmitting(true)   // Aktifkan loading → tombol disable + spinner
  try {
    const user = await login({ email: data.email, password: data.password })
    toast.success(`Selamat datang, ${user.name}!`)
    router.push(user.role === 'ADMIN' ? '/admin' : '/')
  } catch (err) {
    toast.error(getErrorMessage(err))   // Tampilkan pesan error dari API
  } finally {
    setIsSubmitting(false)   // Selalu matikan loading (sukses atau gagal)
  }
}

// Di JSX: tombol disabled saat isSubmitting
<button type="submit" disabled={isSubmitting}>
  {isSubmitting
    ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
    : <><LogIn size={16} /> Masuk</>
  }
</button>
```

### Handle Error dari API

Fungsi `getErrorMessage` di `lib/axios.ts` mengekstrak pesan error dari respons Axios:

```typescript
// lib/axios.ts
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // Ambil message dari response body backend
    // Backend mengembalikan: { success: false, message: "...", statusCode: 401 }
    return err.response?.data?.message ?? 'Terjadi kesalahan'
  }
  return 'Terjadi kesalahan'
}

// Penggunaan di komponen:
catch (err) {
  toast.error(getErrorMessage(err))
  // Contoh tampilan toast:
  // - "Email atau password salah" (401)
  // - "Email sudah terdaftar" (409)
  // - "Password minimal 6 karakter" (400 dari validasi backend)
}
```

---

## Fitur Logout

```typescript
// context/AuthContext.tsx

const logout = () => {
  // 1. Hapus token dan user dari localStorage
  localStorage.removeItem('rentgo_token')
  localStorage.removeItem('rentgo_user')

  // 2. Reset state React
  setToken(null)
  setUser(null)

  // 3. Tampilkan feedback
  toast.success('Berhasil logout')

  // 4. Redirect ke halaman login
  router.push('/login')
}
```

Logout dipanggil dari tombol di Navbar. Setelah logout, `isAuthenticated` menjadi `false`, sehingga `ProtectedRoute` otomatis memblokir akses ke halaman terproteksi.

---

# BAGIAN 5 — OTORISASI & PROTECTED ROUTES

## Cara Implementasi Protected Route

Proyek menggunakan **komponen wrapper `ProtectedRoute`** (bukan Middleware Next.js) karena pendekatan berbasis useEffect yang bekerja baik di semua halaman client-side:

```typescript
// components/ProtectedRoute.tsx

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Setelah loading selesai, cek apakah sudah login
    if (!loading && !isAuthenticated) {
      router.replace('/login')   // replace agar tidak bisa back ke halaman terproteksi
    }
  }, [loading, isAuthenticated, router])

  // Tampilkan spinner selama AuthContext masih loading (cek localStorage)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  // Jika tidak authenticated dan sudah redirect, return null (tidak render apa-apa)
  if (!isAuthenticated) return null

  // Sudah authenticated → render children
  return <>{children}</>
}
```

Dipasang di `layout.tsx` tiap route group:
```typescript
// app/(admin)/layout.tsx — semua halaman admin terlindungi sekaligus
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>          {/* Cek: sudah login? */}
      <RoleGate allow={['ADMIN']}>   {/* Cek: role ADMIN? */}
        {children}
      </RoleGate>
    </ProtectedRoute>
  )
}
```

---

## Role-based UI (RBAC di Frontend)

### Cara Decode Role dari JWT

Role tidak di-decode manual dari JWT. Saat login, server mengembalikan objek `user` yang sudah berisi `role`. User ini disimpan di state `AuthContext` dan localStorage:

```typescript
// Saat login sukses, backend mengembalikan:
// { accessToken: "...", user: { id, name, email, role: "ADMIN" } }

// AuthContext menyimpan user ini ke state:
setUser(data.user)

// Computed value untuk kemudahan:
isAdmin: user?.role === 'ADMIN'
```

### Cara Sembunyikan/Tampilkan Elemen Berdasarkan Role

**Contoh 1: Navbar menampilkan menu berbeda per role**
```tsx
// components/Navbar.tsx

{/* Kondisi rendering berdasarkan isAdmin dari useAuth() */}
{showAuth && isAuthenticated && !isAdmin && (
  <>
    {/* Menu untuk USER biasa */}
    <Link href="/my-rentals">Riwayat Sewa</Link>
    <Link href="/profile">Profil</Link>
  </>
)}

{showAuth && isAuthenticated && isAdmin && (
  <>
    {/* Menu untuk ADMIN */}
    <Link href="/admin">Dashboard</Link>
    <Link href="/admin/vehicles">Kendaraan</Link>
    <Link href="/admin/rentals">Pesanan</Link>
    {/* ... menu admin lainnya */}
  </>
)}
```

**Contoh 2: Tombol Sewa disembunyikan dari Admin**
```tsx
// app/(public)/vehicles/[id]/page.tsx

const { isAuthenticated, isAdmin } = useAuth()

{/* Admin tidak bisa membuat rental */}
{isAdmin && (
  <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
    <p className="text-sm text-yellow-400">
      Anda login sebagai Admin. Fitur sewa tidak tersedia untuk Admin.
    </p>
  </div>
)}

{/* Tombol sewa hanya untuk non-admin */}
{!isAdmin && (
  <button
    onClick={handleSewa}
    disabled={!canBook || submitting}
    className="w-full bg-[#4ade80] ..."
  >
    Sewa Sekarang
  </button>
)}
```

**Contoh 3: RoleGate menutup seluruh halaman admin**
```tsx
// components/RoleGate.tsx

export default function RoleGate({ allow, children }: RoleGateProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Jika sudah login tapi role tidak diizinkan → redirect ke home
    if (!loading && user && !allow.includes(user.role)) {
      router.replace('/')
    }
  }, [loading, user, allow, router])

  // Hanya render children jika role ada dalam daftar allow
  if (!user || !allow.includes(user.role)) return null

  return <>{children}</>
}

// Penggunaan:
<RoleGate allow={['ADMIN']}>
  {/* Hanya ADMIN yang bisa lihat ini */}
</RoleGate>
```

---

## Tabel Matriks Akses Halaman

| Halaman | Path | Login Required | Role Required |
|---|---|---|---|
| Home | `/` | Tidak | — |
| Semua Kendaraan | `/vehicles` | Tidak | — |
| Detail Kendaraan | `/vehicles/[id]` | Tidak (login untuk sewa) | — |
| Hasil Pencarian | `/search` | Tidak | — |
| Tentang Kami | `/about` | Tidak | — |
| Login | `/login` | Tidak (redirect ke / jika sudah login) | — |
| Register | `/register` | Tidak (redirect ke / jika sudah login) | — |
| Sewa Saya | `/my-rentals` | Ya | USER |
| Pembayaran | `/payment/[rentalId]` | Ya | USER |
| Invoice User | `/invoice/[rentalId]` | Ya | USER |
| Profil | `/profile` | Ya | USER |
| Admin Dashboard | `/admin` | Ya | ADMIN |
| Admin Kendaraan | `/admin/vehicles` | Ya | ADMIN |
| Admin Pesanan | `/admin/rentals` | Ya | ADMIN |
| Admin Pembayaran | `/admin/payments` | Ya | ADMIN |
| Admin Invoice | `/admin/invoices` | Ya | ADMIN |
| Admin Review | `/admin/reviews` | Ya | ADMIN |
| Admin Pengguna | `/admin/users` | Ya | ADMIN |

---

# BAGIAN 6 — CRUD INTERFACE & VISUALISASI DATA

## Resource: Kendaraan (Vehicles)

### READ — Tampilkan Daftar Kendaraan

```tsx
// app/(public)/vehicles/page.tsx — Pola fetch data

const [vehicles, setVehicles] = useState<Vehicle[]>([])
const [loading, setLoading] = useState(true)

// useCallback memastikan fungsi tidak dibuat ulang setiap render
const fetchVehicles = useCallback(async () => {
  setLoading(true)
  try {
    // API call dengan parameter filter & pagination
    const res = await vehicleApi.getAll({
      ...(debounced ? { search: debounced } : { status: 'AVAILABLE' }),
      ...(type ? { type } : {}),
      page,
      limit: 12,
    })
    setVehicles(res.items)
    setTotalPages(res.meta.totalPages)
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    setLoading(false)
  }
}, [debounced, type, page])

// Re-fetch saat parameter berubah
useEffect(() => { fetchVehicles() }, [fetchVehicles])
```

**Loading state:** Komponen `SkeletonCard` menampilkan 12 placeholder animasi
```tsx
{loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
) : vehicles.length === 0 ? (
  <EmptyState title="Kendaraan tidak ditemukan" description="Coba ubah filter." />
) : (
  <div className="grid ...">
    {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
  </div>
)}
```

**Pagination:** Tombol prev/next dengan nomor halaman, dirender hanya jika `totalPages > 1`.

### CREATE — Tambah Kendaraan (Admin)

```tsx
// components/VehicleForm.tsx — Form dengan React Hook Form + Zod

const {
  register, handleSubmit,
  formState: { errors },
} = useForm<VehicleFormData>({
  resolver: zodResolver(vehicleSchema),  // Validasi Zod
})

const handleFormSubmit = (data: VehicleFormData) => {
  onSubmit(data, imageFile ?? undefined)  // Kirim data + file gambar
}
```

Alur submit di halaman admin kendaraan:
```tsx
// app/(admin)/admin/vehicles/page.tsx

const handleSubmit = async (data: VehicleFormData, imageFile?: File) => {
  setSubmitting(true)
  try {
    let vehicle: Vehicle
    if (editTarget) {
      // Mode EDIT: PATCH /vehicles/:id
      vehicle = await vehicleApi.update(editTarget.id, data)
      toast.success('Kendaraan berhasil diperbarui!')
    } else {
      // Mode TAMBAH: POST /vehicles
      vehicle = await vehicleApi.create(data)
      toast.success('Kendaraan berhasil ditambahkan!')
    }
    // Upload foto jika ada file yang dipilih
    if (imageFile) {
      const formData = new FormData()
      formData.append('file', imageFile)
      await axiosInstance.post(`/vehicles/${vehicle.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    setShowForm(false)
    fetchVehicles()  // Refresh daftar
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    setSubmitting(false)
  }
}
```

### UPDATE — Edit Kendaraan

Form yang sama (`VehicleForm`) digunakan untuk tambah dan edit. Saat edit, form di-pre-fill dengan data kendaraan:
```tsx
// components/VehicleForm.tsx

useEffect(() => {
  if (initial) {   // initial = data kendaraan yang akan diedit
    reset({        // react-hook-form reset mengisi semua field sekaligus
      name:        initial.name,
      brand:       initial.brand,
      model:       initial.model,
      type:        initial.type,
      year:        initial.year,
      plateNumber: initial.plateNumber,
      pricePerDay: initial.pricePerDay,
      // ... field lainnya
    })
    if (initial.imageUrl) setPreview(initial.imageUrl)
  }
}, [initial, reset])
```

### DELETE — Hapus Kendaraan

Modal konfirmasi sebelum menghapus:
```tsx
// app/(admin)/admin/vehicles/page.tsx

{/* Modal konfirmasi */}
{deleteTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center ...">
    <p>Hapus kendaraan "{deleteTarget.name}"?</p>
    <button onClick={() => setDeleteTarget(null)}>Batal</button>
    <button onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Menghapus...' : 'Hapus'}
    </button>
  </div>
)}

const handleDelete = async () => {
  setDeleting(true)
  try {
    await vehicleApi.remove(deleteTarget.id)
    toast.success('Kendaraan berhasil dihapus!')
    setDeleteTarget(null)
    fetchVehicles()   // Refresh tanpa data yang dihapus
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    setDeleting(false)
  }
}
```

---

## Resource: Pesanan (Rentals)

### Buat Rental (User)

```tsx
// app/(public)/vehicles/[id]/page.tsx

const handleSewa = async () => {
  if (!isAuthenticated) {
    router.push('/login')  // Redirect login jika belum auth
    return
  }
  if (!startDate || !endDate || dateError) {
    toast.error('Lengkapi tanggal sewa dengan benar')
    return
  }
  setSubmitting(true)
  try {
    await rentalApi.create({ vehicleId: id, startDate, endDate })
    toast.success('Sewa berhasil dibuat!')
    router.push('/my-rentals')   // Redirect ke halaman sewa saya
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    setSubmitting(false)
  }
}
```

**Estimasi harga** dihitung di frontend secara real-time:
```tsx
const diffDays = (() => {
  if (!startDate || !endDate) return 0
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
})()
const estimatedTotal = vehicle ? diffDays * vehicle.pricePerDay : 0
```

---

## Resource: Review

### Buat Review (User — setelah rental COMPLETED)

```tsx
// components/ReviewForm.tsx

const handleSubmit = async () => {
  if (rating === 0) { toast.error('Pilih rating dulu!'); return }
  if (!comment.trim()) { toast.error('Tulis komentar dulu!'); return }

  setLoading(true)
  try {
    await reviewApi.create({ rentalId, rating, comment })
    setRating(0)
    setComment('')
    onSuccess?.()   // Callback ke halaman induk (update state reviewedIds)
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    setLoading(false)
  }
}
```

### Tampilkan Review dengan Rata-rata Rating

```tsx
// components/ReviewList.tsx — Fetch data dan tampilkan

useEffect(() => {
  const fetch = async () => {
    try {
      const res = await reviewApi.getByVehicle(vehicleId)
      setData(res)   // { vehicleId, avgRating, totalReviews, reviews: [...] }
    } catch { }
    finally { setLoading(false) }
  }
  fetch()
}, [vehicleId])
```

---

# BAGIAN 7 — MANAJEMEN TRANSAKSI & FEEDBACK UI

## Alur Transaksi Multi-Langkah di Frontend

### Alur Sewa Kendaraan (User)

```
Step 1: PILIH KENDARAAN
  Halaman /vehicles atau /vehicles/[id]
  → User pilih kendaraan, lihat detail, set tanggal sewa
  → Estimasi total harga tampil real-time

Step 2: BUAT RENTAL
  User klik "Sewa Sekarang"
  → POST /rentals dengan { vehicleId, startDate, endDate }
  → Redirect ke /my-rentals
  → Status rental: PENDING

Step 3: PILIH METODE & BUAT PAYMENT
  User klik "Bayar Sekarang" di /my-rentals
  → Redirect ke /payment/[rentalId]
  → User pilih metode (Transfer / QRIS)
  → Klik "Lanjut Bayar" → POST /payments → status: PENDING
  → Tampilkan info rekening/QR code sesuai metode

Step 4: UPLOAD BUKTI PEMBAYARAN
  User transfer/scan lalu ambil screenshot
  → Upload foto bukti di halaman payment
  → POST /payments/:id/proof
  → proofStatus: PENDING_REVIEW
  → Menunggu konfirmasi admin

Step 5: KONFIRMASI ADMIN
  Admin buka /admin/payments
  → Lihat bukti yang diupload
  → Klik Konfirmasi → POST /payments/:id/confirm
  → Payment status: PAID
  → Rental status: CONFIRMED
  → Invoice otomatis di-generate

Step 6: SELESAI & REVIEW
  Setelah sewa selesai (admin selesaikan rental)
  → User bisa beri review di /my-rentals
  → Klik "Beri Review" → form bintang + komentar
  → POST /reviews
```

---

## Implementasi Feedback Pengguna

### Toast Notification

Menggunakan `react-hot-toast` yang dikonfigurasi di `providers.tsx`:

```tsx
// app/providers.tsx

<Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    success: {
      style: {
        background: '#f0fdfa',  // Teal muda
        color: '#0f766e',
        border: '1px solid #99f6e4',
      },
    },
    error: {
      style: {
        background: '#fef2f2',  // Merah muda
        color: '#b91c1c',
        border: '1px solid #fecaca',
      },
    },
  }}
/>

// Penggunaan di komponen:
toast.success('Kendaraan berhasil ditambahkan!')
toast.error('Nomor plat sudah terdaftar')
```

### Modal Konfirmasi (Aksi Destruktif)

Pola modal konfirmasi yang konsisten di seluruh proyek:

```tsx
// Pola umum modal konfirmasi (contoh dari /my-rentals)

{/* State untuk menyimpan item yang akan di-delete/cancel */}
const [cancelTarget, setCancelTarget] = useState<Rental | null>(null)

{/* Tombol trigger */}
<button onClick={() => setCancelTarget(rental)}>Batalkan Pesanan</button>

{/* Modal — muncul saat cancelTarget tidak null */}
{cancelTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop — klik untuk tutup */}
    <div className="absolute inset-0 bg-black/60" onClick={() => setCancelTarget(null)} />

    {/* Dialog */}
    <div className="relative bg-[#0f1f2e] border border-white/10 rounded-2xl p-6 z-10">
      <p>Batalkan pesanan {cancelTarget.vehicle?.name}?</p>

      <div className="flex gap-3">
        <button onClick={() => setCancelTarget(null)} disabled={!!cancellingId}>
          Tidak, Kembali
        </button>
        <button onClick={handleCancel} disabled={!!cancellingId}>
          {cancellingId ? 'Membatalkan...' : 'Ya, Batalkan'}
        </button>
      </div>
    </div>
  </div>
)}
```

### Loading State per Komponen

Setiap komponen punya loading state sendiri (bukan loading global), sehingga hanya bagian yang bersangkutan yang menampilkan spinner:

```tsx
// Pola loading state per-item (contoh: tombol hapus individual)
const [deletingId, setDeletingId] = useState<string | null>(null)

// Saat hapus item dengan id tertentu
setDeletingId(item.id)
try {
  await api.delete(item.id)
  toast.success('Berhasil dihapus!')
} finally {
  setDeletingId(null)
}

// Di JSX: spinner hanya di tombol item yang sedang dihapus
<button disabled={deletingId === item.id}>
  {deletingId === item.id
    ? <><Loader2 className="animate-spin" /> Menghapus...</>
    : <><Trash2 /> Hapus</>
  }
</button>
```

---

## State Management

Proyek menggunakan **React Context + useState** tanpa library state management eksternal (tidak ada Redux/Zustand). Ini cukup karena state global yang dibutuhkan hanya data autentikasi.

**AuthContext** menyimpan:
- `user`: data user yang sedang login (atau null)
- `token`: JWT token (atau null)
- `loading`: apakah sedang cek sesi (cegah flash redirect)
- `isAuthenticated`: computed dari `!!token`
- `isAdmin`: computed dari `user?.role === 'ADMIN'`
- `login()`, `logout()`, `register()`, `setUser()`: fungsi aksi

Semua halaman lain menggunakan **local state (`useState`)** untuk data yang hanya relevan di halaman tersebut (daftar kendaraan, filter aktif, modal yang terbuka, dll).

---

# BAGIAN 8 — INTEGRASI API BACKEND

## Konfigurasi Base URL

```typescript
// lib/axios.ts

const axiosInstance = axios.create({
  // Mengambil URL dari environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

Di `.env.local`:
```
NEXT_PUBLIC_API_URL=https://rent-go-production.up.railway.app
```

Prefix `NEXT_PUBLIC_` wajib agar variabel bisa diakses di browser (client-side). Tanpa prefix ini, variabel hanya tersedia di server-side Next.js.

---

## API Client Terpusat

File `lib/api.ts` berisi semua fungsi API call yang terorganisir per resource:

```typescript
// lib/api.ts — Helper unwrap untuk mengekstrak data dari response
// Backend selalu mengembalikan: { success, message, data: { ... } }

export function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data
}

// Semua API call menggunakan pattern yang sama:
export const vehicleApi = {
  getAll: (params?: VehicleParams): Promise<VehicleListResponse> =>
    axiosInstance.get('/vehicles', { params }).then(unwrap<VehicleListResponse>),

  getOne: (id: string): Promise<Vehicle> =>
    axiosInstance.get(`/vehicles/${id}`).then(unwrap<Vehicle>),

  create: (dto: CreateVehicleDto): Promise<Vehicle> =>
    axiosInstance.post('/vehicles', dto).then(unwrap<Vehicle>),

  update: (id: string, dto: UpdateVehicleDto): Promise<Vehicle> =>
    axiosInstance.patch(`/vehicles/${id}`, dto).then(unwrap<Vehicle>),

  remove: (id: string): Promise<void> =>
    axiosInstance.delete(`/vehicles/${id}`).then(() => undefined),
}
```

Token dikirim otomatis melalui Axios interceptor — tidak perlu menambahkan header di setiap fungsi.

---

## Tabel Semua Endpoint API yang Dikonsumsi

### Auth

| Method | Endpoint | Kegunaan | Auth | Data Dikirim |
|---|---|---|---|---|
| POST | /auth/register | Daftar akun baru | Tidak | `{ name, email, password, phone? }` |
| POST | /auth/login | Login, dapatkan JWT | Tidak | `{ email, password }` |
| GET | /auth/me | Ambil profil user | Ya | — |
| PATCH | /auth/profile | Update nama & telepon | Ya | `{ name?, phone? }` |
| POST | /auth/profile/avatar | Upload foto profil | Ya | `multipart/form-data: file` |

### Vehicles

| Method | Endpoint | Kegunaan | Auth | Data Dikirim |
|---|---|---|---|---|
| GET | /vehicles | Daftar kendaraan | Tidak | Query: `type, status, search, page, limit, location, category` |
| GET | /vehicles/:id | Detail kendaraan | Tidak | — |
| POST | /vehicles | Tambah kendaraan | Ya (ADMIN) | `CreateVehicleDto` |
| PATCH | /vehicles/:id | Update kendaraan | Ya (ADMIN) | `UpdateVehicleDto` (partial) |
| DELETE | /vehicles/:id | Hapus kendaraan | Ya (ADMIN) | — |
| POST | /vehicles/:id/image | Set foto utama | Ya (ADMIN) | `multipart/form-data: file` |
| GET | /vehicles/:id/images | Daftar foto galeri | Tidak | — |
| POST | /vehicles/:id/images | Tambah foto galeri | Ya (ADMIN) | `multipart/form-data: file` |
| DELETE | /vehicles/:id/images/:imgId | Hapus foto galeri | Ya (ADMIN) | — |

### Rentals

| Method | Endpoint | Kegunaan | Auth | Data Dikirim |
|---|---|---|---|---|
| POST | /rentals | Buat sewa baru | Ya (USER) | `{ vehicleId, startDate, endDate }` |
| GET | /rentals | Daftar sewa (user: miliknya) | Ya | Query: `status, page, limit` |
| GET | /rentals/:id | Detail sewa | Ya | — |
| PATCH | /rentals/:id/status | Ubah status sewa | Ya (ADMIN) | `{ status }` |
| PATCH | /rentals/:id/complete | Selesaikan sewa | Ya (ADMIN) | — |
| PATCH | /rentals/:id/cancel | Batalkan sewa | Ya | — |

### Payments

| Method | Endpoint | Kegunaan | Auth | Data Dikirim |
|---|---|---|---|---|
| POST | /payments | Buat pembayaran | Ya (USER) | `{ rentalId, method }` |
| GET | /payments | Semua pembayaran | Ya (ADMIN) | Query: `status, page, limit` |
| GET | /payments/info/:method | Info cara bayar | Tidak | — |
| GET | /payments/rental/:rentalId | Detail bayar per rental | Ya | — |
| POST | /payments/:id/proof | Upload bukti | Ya (USER) | `multipart/form-data: file` |
| POST | /payments/:id/confirm | Konfirmasi bukti | Ya (ADMIN) | — |
| POST | /payments/:id/reject | Tolak bukti | Ya (ADMIN) | — |
| POST | /payments/:id/pay | Mock bayar | Ya | — |

### Invoices, Reviews, Users, Dashboard

| Method | Endpoint | Kegunaan | Auth |
|---|---|---|---|
| GET | /invoices | Semua invoice | Ya (ADMIN) |
| GET | /invoices/rental/:rentalId | Invoice per rental | Ya |
| POST | /invoices/rental/:rentalId/generate | Generate invoice | Ya (ADMIN) |
| POST | /reviews | Buat review | Ya (USER) |
| GET | /reviews/my | Review milik saya | Ya |
| GET | /reviews/vehicle/:vehicleId | Review kendaraan | Tidak |
| DELETE | /reviews/:id | Hapus review | Ya |
| GET | /users | Daftar user | Ya (ADMIN) |
| DELETE | /users/:id | Hapus user | Ya (ADMIN) |
| GET | /dashboard/stats | Statistik dashboard | Ya (ADMIN) |

---

## Handle Error dari API Secara Konsisten

```typescript
// Axios response interceptor sudah menangani 401 secara global (lib/axios.ts)
// Error lain ditangani di level komponen:

try {
  const data = await vehicleApi.create(dto)
  toast.success('Berhasil!')
} catch (err) {
  // getErrorMessage mengekstrak pesan dari response body
  const message = getErrorMessage(err)

  // Semua error tampil sebagai toast merah
  toast.error(message)

  // Contoh pesan yang tampil berdasarkan status:
  // 400 → "Plat nomor sudah terdaftar" (dari validasi DTO)
  // 401 → Otomatis redirect ke /login (interceptor global)
  // 403 → "Akses ditolak: Anda tidak memiliki izin" (dari backend)
  // 404 → "Kendaraan tidak ditemukan"
  // 409 → "Nomor plat sudah terdaftar"
  // 500 → "Terjadi kesalahan pada server"
}
```

---

## Handle CORS

Tidak ada konfigurasi CORS di frontend. Konfigurasi CORS dilakukan di backend (NestJS `app.enableCors()`), yang sudah mengizinkan domain Vercel dan localhost:

```typescript
// Backend main.ts (NestJS) sudah mengizinkan:
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    /\.vercel\.app$/,   // Semua subdomain Vercel
  ],
  credentials: true,
})
```

---

# BAGIAN 9 — RESPONSIVITAS & UI/UX

## Pendekatan Responsive dengan Tailwind CSS

Proyek menggunakan **mobile-first approach**: styling default untuk mobile, lalu override untuk layar lebih besar:

```tsx
{/* Contoh dari grid kendaraan */}
<div className="
  grid
  grid-cols-1          {/* Mobile: 1 kolom */}
  sm:grid-cols-2       {/* ≥640px: 2 kolom */}
  lg:grid-cols-3       {/* ≥1024px: 3 kolom */}
  xl:grid-cols-4       {/* ≥1280px: 4 kolom */}
  gap-5
">

{/* Contoh dari tombol di halaman */}
<button className="
  w-full               {/* Mobile: full width */}
  sm:w-auto            {/* ≥640px: sesuai konten */}
">

{/* Contoh dari padding halaman */}
<div className="
  px-4                 {/* Mobile: 16px */}
  sm:px-6              {/* ≥640px: 24px */}
  lg:px-8              {/* ≥1024px: 32px */}
">
```

---

## Breakpoint yang Digunakan

| Breakpoint | Lebar | Tampilan yang Berubah |
|---|---|---|
| Default (mobile) | < 640px | 1 kolom grid, hamburger menu, kartu menggantikan tabel, padding kecil |
| `sm` | ≥ 640px | 2 kolom grid, beberapa item naik ke satu baris |
| `md` | ≥ 768px | Form 2 kolom di VehicleForm, kartu user summary mulai 3 kolom |
| `lg` | ≥ 1024px | Tabel tampil (hidden sebelumnya), grid 3-4 kolom, sidebar panel kanan |
| `xl` | ≥ 1280px | Grid 4 kolom kendaraan, max-width container penuh |

---

## Komponen dengan Tampilan Berbeda di Mobile vs Desktop

### Navbar
```tsx
{/* Desktop: semua menu tampil horizontal */}
<div className="hidden md:flex items-center gap-1">
  {/* Link menu, avatar, tombol logout */}
</div>

{/* Mobile: hamburger button */}
<button className="md:hidden">
  <Menu size={22} />
</button>

{/* Mobile: menu dropdown (muncul saat hamburger diklik) */}
{menuOpen && (
  <div className="md:hidden px-4 py-4 space-y-1.5">
    {/* Link menu vertikal */}
  </div>
)}
```

### Tabel Admin → Kartu di Mobile

Semua halaman admin menggunakan pola ini:
```tsx
{/* Tabel — hanya tampil di layar besar */}
<div className="hidden lg:block card !p-0 overflow-hidden">
  <table>...</table>
</div>

{/* Kartu — tampil di mobile */}
<div className="lg:hidden space-y-3">
  {items.map((item) => (
    <div className="card">
      {/* Data yang sama, disusun vertikal */}
    </div>
  ))}
</div>
```

### Grid Kendaraan (Home & Vehicles)

```tsx
{/* Responsif dari 1 kolom ke 4 kolom */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
  {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
</div>
```

### Panel Sewa — dari Bawah ke Sidebar Kanan

```tsx
{/* Di detail kendaraan */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Konten kiri: foto + spesifikasi */}
  <div className="lg:col-span-2 space-y-5">...</div>

  {/* Panel kanan: form sewa (sticky di desktop, normal di mobile) */}
  <div className="lg:col-span-1">
    <div className="sticky top-24">  {/* Sticky hanya efektif di desktop */}
      {/* Form sewa */}
    </div>
  </div>
</div>
```

---

## Aksesibilitas Dasar

**Alt text pada gambar:**
```tsx
<img src={vehicle.imageUrl} alt={vehicle.name} />
<img src={user.avatarUrl} alt="Avatar" />
<img src={proofUrl} alt="Bukti pembayaran" />
```

**Aria-label pada tombol icon:**
```tsx
<button aria-label="Toggle menu">
  {menuOpen ? <X /> : <Menu />}
</button>
```

**Focus state:** Tailwind `focus:outline-none focus:ring-2 focus:ring-primary-500` pada semua input field di `.input-field`.

**Disabled state:** Semua tombol menggunakan `disabled` attribute saat loading + `disabled:opacity-50 disabled:cursor-not-allowed` styling.

**Semantic HTML:** Menggunakan `<nav>`, `<main>`, `<footer>`, `<button>` (bukan `<div>` yang diclick), `<a>` untuk navigasi.

**Color contrast:** Teks `text-white` di atas background `#080f1a` memiliki kontras yang tinggi. Aksen hijau `#4ade80` digunakan untuk elemen interaktif yang menonjol.

---

# BAGIAN 10 — BAHAN PRESENTASI & TANYA JAWAB

## Outline Slide Presentasi (8 Slide)

---

**Slide 1 — Perkenalan Proyek + Demo Langsung**
- Judul: "RentGo Frontend — Platform Sewa Kendaraan Online"
- Nama, kelas, jurusan RPL
- Screenshot halaman home (hero + daftar kendaraan)
- Demo live: buka browser, tunjukkan halaman utama
- Tagline: "UI modern, responsif, dark mode, terintegrasi penuh dengan backend"

---

**Slide 2 — Tech Stack + Alasan Pemilihan**
- Logo grid: Next.js + TypeScript + Tailwind + Axios + React Hook Form + Zod + Recharts
- Tabel singkat versi dan kegunaan masing-masing
- Alasan memilih Next.js vs React biasa (App Router, SSR, file-based routing)
- Alasan Tailwind (utility-first, tidak perlu file CSS terpisah)
- Alasan Zod + React Hook Form (validasi type-safe, mudah dikombinasikan)

---

**Slide 3 — Struktur Folder + Arsitektur**
- Diagram alur: User → Next.js → ProtectedRoute → Component → Axios → Backend → State → UI
- Tree struktur folder (level 2)
- Penjelasan route group: `(public)`, `(auth)`, `(admin)`, `(user)`
- Alur data: Context API (global) vs useState (lokal)

---

**Slide 4 — Implementasi Auth + Demo Login**
- Diagram alur login → token → localStorage → interceptor → request
- Screenshot form login (dark mode, validasi real-time)
- Demo live: login sebagai ADMIN → redirect dashboard; login sebagai USER → redirect home
- Kode: AuthContext, localStorage, Axios interceptor

---

**Slide 5 — Demo CRUD (Tambah, Edit, Hapus Data)**
- Screenshot modal form tambah kendaraan
- Demo live: tambah kendaraan baru dengan foto
- Demo live: edit data kendaraan
- Demo live: hapus kendaraan dengan modal konfirmasi
- Demo live: kelola galeri foto (upload, preview, hapus)

---

**Slide 6 — Integrasi API Backend (Tunjukkan Network Request)**
- Screenshot DevTools → Network tab → request dengan Bearer Token di header
- Tabel endpoint yang dikonsumsi (Auth, Vehicle, Rental, Payment)
- Kode `lib/api.ts` (vehicleApi, rentalApi, paymentApi)
- Demo: upload bukti bayar → konfirmasi admin → invoice otomatis

---

**Slide 7 — Responsive Design (Tunjukkan di Mobile)**
- Screenshot tabel admin di desktop vs kartu di mobile
- Screenshot Navbar desktop (link horizontal) vs mobile (hamburger menu)
- Screenshot grid kendaraan: 4 kolom desktop vs 1 kolom mobile
- DevTools Toggle Device Toolbar: resize browser live
- Kode pola `hidden lg:block` dan `lg:hidden`

---

**Slide 8 — Tantangan & Solusi**
- Tantangan 1: Restore sesi saat refresh halaman tanpa flash redirect
  - Solusi: `loading` state di AuthContext, ProtectedRoute menunggu loading selesai sebelum redirect
- Tantangan 2: CitySelector dropdown tertutup oleh elemen lain
  - Solusi: React `createPortal` untuk render dropdown di `document.body`
- Tantangan 3: Skeleton loading sebelum data tersedia
  - Solusi: Komponen `SkeletonCard` dan `SkeletonTable` yang dikondisikan dengan `loading` state
- Tantangan 4: Form berbeda mode (tambah vs edit) dengan state yang sama
  - Solusi: Prop `initial?` di `VehicleForm`, jika ada → mode edit, jika tidak → mode tambah
- Penutup + terima kasih

