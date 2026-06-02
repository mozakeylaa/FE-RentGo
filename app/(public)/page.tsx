'use client'

import { useEffect, useState, useCallback } from 'react'
import CitySelector from "@/components/CitySelector"
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Calendar, MapPin, Shield, Clock, CreditCard, Headphones,
  ChevronRight as Arrow, Car, Bike
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { vehicleApi, reviewApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import type { Vehicle, VehicleType } from '@/types'
import VehicleCard from '@/components/VehicleCard'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

const VEHICLE_TYPES: { value: VehicleType | ''; label: string }[] = [
  { value: '',           label: 'Semua' },
  { value: 'CAR',        label: 'Mobil' },
  { value: 'MOTORCYCLE', label: 'Motor' },
]

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function StatCard({ value, label, suffix = '', decimals = 0 }: { value: number; label: string; suffix?: string; decimals?: number }) {
  const count = useCountUp(Math.round(value))
  const display = decimals > 0 ? value.toFixed(decimals) : count.toLocaleString('id-ID')
  return (
    <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
      <p className="text-2xl font-extrabold text-[#4ade80]">{display}{suffix}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </div>
  )
}

function StatsSection() {
  const [stats, setStats] = useState({
    availableVehicles: 0,
    totalVehicles: 0,
    avgRating: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [available, reviews] = await Promise.all([
          vehicleApi.getAll({ status: 'AVAILABLE', limit: 1 }),
          reviewApi.getAll(),
        ])

        const avg = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0

        setStats({
          availableVehicles: available.meta?.total ?? 0,
          totalVehicles: available.meta?.total ?? 0,
          avgRating: Math.round(avg * 10) / 10, // 1 desimal, misal 4.7
        })
      } catch { }
    }
    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard value={stats.availableVehicles} label="Kendaraan Tersedia" />
      <StatCard value={10000}                   label="Pelanggan Puas"     suffix="+" />
      <StatCard value={50}                      label="Kota Terjangkau"    suffix="+" />
      <StatCard value={stats.avgRating}         label="Rating Pelanggan"   suffix="★" decimals={1} />
    </div>
  )
}

export default function HomePage() {
  const [vehicles, setVehicles]               = useState<Vehicle[]>([])
  const [loading, setLoading]                 = useState(true)
  const [search, setSearch]                   = useState('')
  const [category, setCategory]               = useState('')
  const [lokasi, setLokasi]                   = useState('')
  const [type, setType]                       = useState<VehicleType | ''>('')
  const [page, setPage]                       = useState(1)
  const [totalPages, setTotalPages]           = useState(1)
  const [debounced, setDebounced]             = useState('')
  const [debouncedLokasi, setDebouncedLokasi] = useState('')
  const [startDate, setStartDate]             = useState('')
  const [endDate, setEndDate]                 = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(1) }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setDebouncedLokasi(lokasi)
    setPage(1)
  }, [lokasi])

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...(debounced  ? { search: debounced }     : {}),
        ...(category   ? { category }              : {}),
        ...(!debounced && !category ? { status: 'AVAILABLE' as const } : {}),
        ...(type            ? { type }                       : {}),
        ...(debouncedLokasi ? { location: debouncedLokasi } : {}),
        page,
        limit: 8,
      }
      const res = await vehicleApi.getAll(params)
      setVehicles(res.items)
      setTotalPages(res.meta.totalPages)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [debounced, category, type, debouncedLokasi, page])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const handleTypeChange = (val: VehicleType | '') => { setType(val); setPage(1) }

  const handleCategoryClick = (tag: string, vehicleType: VehicleType) => {
    setCategory(tag)
    setType(vehicleType)
    setDebounced('')
    setSearch('')
    setPage(1)
    setTimeout(() => {
      document.getElementById('kendaraan')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="bg-[#080f1a]">

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080f1a]/70 via-[#080f1a]/60 to-[#080f1a]" />
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-[#4ade80] opacity-[0.05] pointer-events-none blur-3xl" />
        <div className="absolute bottom-[100px] left-[-60px] w-[400px] h-[400px] rounded-full bg-[#4ade80] opacity-[0.03] pointer-events-none blur-3xl" />

        <div className="max-w-6xl mx-auto text-center relative z-10 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/25 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 text-[#4ade80] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block animate-pulse" />
            Platform sewa kendaraan terpercaya #1 di Indonesia
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-5 leading-tight tracking-tight text-white drop-shadow-2xl">
            Gaskeun Kemana Aja, <br />
            <span className="text-[#4ade80]">Sekarang.</span>
          </h1>
          <p className="text-white/50 text-base md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Pilih dari ratusan kendaraan berkualitas. Proses cepat, harga transparan, siap antar jemput.
          </p>

          {/* Search Box */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-black/40 border border-white/10 rounded-2xl flex flex-col md:flex-row overflow-visible backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-white/10">
                <Car size={20} className="text-[#4ade80] flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Nama Kendaraan</p>
                  <input
                    type="text"
                    placeholder="Cari mobil, motor..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCategory('') }}
                    className="w-full text-sm text-white placeholder:text-white/25 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-white/10 overflow-visible">
                <MapPin size={20} className="text-[#4ade80] flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Lokasi</p>
                  <CitySelector
                    dark
                    value={lokasi}
                    onChange={(val) => { setLokasi(val); setPage(1) }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-white/10">
                <Calendar size={20} className="text-[#4ade80] flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Tanggal Mulai</p>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => { setStartDate(e.target.value); setEndDate('') }}
                    className="w-full text-sm text-white focus:outline-none bg-transparent cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 border-white/10">
                <Calendar size={20} className="text-[#4ade80] flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Tanggal Selesai</p>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full text-sm focus:outline-none bg-transparent cursor-pointer [color-scheme:dark] ${!startDate ? 'text-white/25' : 'text-white'}`}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const params = new URLSearchParams()
                  if (search)    params.set('search',    search)
                  if (lokasi)    params.set('lokasi',    lokasi)   // ← key tetap 'lokasi'
                  if (startDate) params.set('startDate', startDate)
                  if (endDate)   params.set('endDate',   endDate)
                  window.location.href = `/search?${params.toString()}`
                }}
                className="flex items-center justify-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] active:bg-[#16a34a] text-[#080f1a] font-bold px-8 py-4 transition-colors text-sm flex-shrink-0 w-full md:w-auto rounded-b-2xl md:rounded-b-none md:rounded-r-2xl"
              >
                <Search size={18} /> Cari
              </button>
            </div>

            {startDate && endDate && (
              <p className="text-center text-[#4ade80]/60 text-xs mt-3">
                📅 {new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                {' — '}
                {new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="max-w-3xl mx-auto mt-12">
            <StatsSection />
          </div>
        </div>
      </section>

      {/* ===== KEUNGGULAN ===== */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Mengapa Pilih RentGo?</h2>
          <p className="text-white/40 text-sm mt-2">Kami hadir untuk memudahkan perjalananmu</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Shield size={22} />,     title: 'Aman & Terpercaya',  desc: 'Semua kendaraan telah melalui inspeksi ketat dan diasuransikan.' },
            { icon: <Clock size={22} />,      title: 'Proses Cepat',       desc: 'Booking dalam hitungan menit, kendaraan siap dalam 1 jam.' },
            { icon: <CreditCard size={22} />, title: 'Harga Transparan',   desc: 'Tidak ada biaya tersembunyi. Bayar sesuai yang tertera.' },
            { icon: <Headphones size={22} />, title: 'Support 24/7',       desc: 'Tim kami siap membantu kamu kapanpun dibutuhkan.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center group hover:border-[#4ade80]/30 hover:bg-white/[0.07] transition-all">
              <div className="w-12 h-12 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#4ade80]/20 transition-all">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== KATEGORI ===== */}
      <section className="bg-white/[0.02] border-y border-white/[0.06] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Kategori Kendaraan</h2>
            <p className="text-white/40 text-sm mt-2">Pilih sesuai kebutuhan perjalananmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              { icon: <Car size={28} />, label: 'Mobil', val: 'CAR' as VehicleType, desc: 'Cocok untuk perjalanan keluarga, bisnis, atau perjalanan jauh dengan kenyamanan penuh.', tags: ['MPV', 'SUV', 'Sedan'], iconBg: 'bg-[#93c5fd]/10 border border-[#93c5fd]/20', iconColor: 'text-[#93c5fd]', tagStyle: 'bg-[#93c5fd]/10 text-[#93c5fd] border border-[#93c5fd]/20', hoverBorder: 'hover:border-[#93c5fd]/30' },
              { icon: <Bike size={28} />, label: 'Motor', val: 'MOTORCYCLE' as VehicleType, desc: 'Lincah di jalanan kota, hemat BBM, dan mudah menembus kemacetan kapanpun kamu butuh.', tags: ['Matic', 'Manual', 'Sport'], iconBg: 'bg-[#4ade80]/10 border border-[#4ade80]/20', iconColor: 'text-[#4ade80]', tagStyle: 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20', hoverBorder: 'hover:border-[#4ade80]/30' },
            ].map((c) => (
              <div
                key={c.val}
                onClick={() => { handleTypeChange(c.val); document.getElementById('kendaraan')?.scrollIntoView({ behavior: 'smooth' }) }}
                className={`relative overflow-hidden text-left bg-white/[0.04] border border-white/10 ${c.hoverBorder} hover:bg-white/[0.07] hover:-translate-y-1 transition-all group cursor-pointer flex flex-col gap-4 rounded-2xl p-6`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${c.iconBg} ${c.iconColor}`}>{c.icon}</div>
                <div>
                  <p className="font-semibold text-white text-lg">{c.label}</p>
                  <p className="text-sm text-white/40 mt-1 leading-relaxed">{c.desc}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {c.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryClick(tag, c.val)
                      }}
                      className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer hover:opacity-75 transition-opacity ${c.tagStyle}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <span className="absolute bottom-4 right-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-lg">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CARA SEWA ===== */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Cara Sewa Kendaraan</h2>
          <p className="text-white/40 text-sm mt-2">Hanya 3 langkah mudah</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            { step: '01', title: 'Pilih Kendaraan',    desc: 'Cari dan pilih kendaraan yang sesuai dengan kebutuhanmu dari ratusan pilihan.' },
            { step: '02', title: 'Tentukan Tanggal',   desc: 'Pilih tanggal mulai dan selesai sewa. Estimasi harga langsung tampil otomatis.' },
            { step: '03', title: 'Nikmati Perjalanan', desc: 'Konfirmasi pemesanan dan kendaraan siap diantarkan ke lokasi kamu.' },
          ].map((s) => (
            <div key={s.step} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center relative z-10 hover:border-[#4ade80]/25 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/25 text-[#4ade80] flex items-center justify-center mx-auto mb-4 text-lg font-bold">{s.step}</div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DAFTAR KENDARAAN ===== */}
      <section id="kendaraan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Kendaraan Tersedia</h2>
            <p className="text-white/40 text-sm mt-0.5">
              {category ? `Menampilkan kategori: ${category}` : 'Semua kendaraan siap disewa hari ini'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {category && (
              <button
                onClick={() => { setCategory(''); setType(''); setPage(1) }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/40 hover:bg-[#4ade80]/25 transition-all"
              >
                ✕ {category}
              </button>
            )}
            <span className="flex items-center gap-1.5 text-sm font-medium text-white/50"><SlidersHorizontal size={16} /> Filter:</span>
            {VEHICLE_TYPES.map((t) => (
              <button key={t.value} onClick={() => handleTypeChange(t.value)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${type === t.value ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40' : 'bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/80'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState title="Kendaraan tidak ditemukan" description="Coba ubah kata kunci atau filter pencarian." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vehicles.map((v) => (<VehicleCard key={v.id} vehicle={v} startDate={startDate} endDate={endDate} />))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 py-2 px-3 rounded-xl disabled:opacity-40 transition-all"><ChevronLeft size={16} /></button>
                <span className="text-sm text-white/50 font-medium">Halaman {page} dari {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 py-2 px-3 rounded-xl disabled:opacity-40 transition-all"><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="mx-4 md:mx-8 lg:mx-16 my-10 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-3xl px-8 py-16 text-white text-center relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-40px] w-[300px] h-[300px] rounded-full bg-[#4ade80] opacity-[0.05] pointer-events-none blur-2xl" />
        <div className="absolute bottom-[-60px] left-[-40px] w-[250px] h-[250px] rounded-full bg-[#4ade80] opacity-[0.04] pointer-events-none blur-2xl" />
        <h2 className="text-2xl md:text-4xl font-extrabold mb-3 text-white relative z-10">Siap Memulai Perjalanan?</h2>
        <p className="text-white/40 text-sm md:text-base mb-8 max-w-md mx-auto relative z-10">Daftar sekarang dan dapatkan kemudahan sewa kendaraan kapan saja, di mana saja.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap relative z-10">
          <Link href="/register" className="bg-[#4ade80] text-[#080f1a] font-bold px-8 py-3.5 rounded-xl hover:bg-[#22c55e] transition-colors text-sm inline-flex items-center gap-2">Daftar Gratis <Arrow size={16} /></Link>
          <Link href="/login" className="border border-white/20 text-white/70 font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-sm">Masuk Sekarang</Link>
        </div>
      </section>
    </div>
  )
}