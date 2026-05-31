'use client'

import { useEffect, useState, useCallback } from 'react'
import CitySelector from "@/components/CitySelector"
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Calendar, MapPin, Shield, Clock, CreditCard, Headphones,
  ArrowRight, Car, Bike
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { vehicleApi } from '@/lib/api'
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

function StatCard({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const count = useCountUp(value)
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold text-[#0369a1]">{count.toLocaleString('id-ID')}{suffix}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}

function StatsSection() {
  const [stats, setStats] = useState({ totalVehicles: 0, availableVehicles: 0 })
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [all, available] = await Promise.all([
          vehicleApi.getAll({ limit: 1 }),
          vehicleApi.getAll({ status: 'AVAILABLE', limit: 1 }),
        ])
        setStats({ totalVehicles: all.meta?.total ?? 0, availableVehicles: available.meta?.total ?? 0 })
      } catch { }
    }
    fetchStats()
  }, [])
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x divide-slate-200">
      <StatCard value={stats.availableVehicles} label="Kendaraan Tersedia" />
      <StatCard value={10000}                   label="Pelanggan Puas"     suffix="+" />
      <StatCard value={50}                      label="Kota Terjangkau"    suffix="+" />
      <StatCard value={49}                      label="Rating Pelanggan"   suffix="★" />
    </div>
  )
}

export default function HomePage() {
  const [vehicles, setVehicles]               = useState<Vehicle[]>([])
  const [loading, setLoading]                 = useState(true)
  const [search, setSearch]                   = useState('')
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
        ...(debounced ? { search: debounced } : { status: 'AVAILABLE' as const }),
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
  }, [debounced, type, debouncedLokasi, page])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const handleTypeChange = (val: VehicleType | '') => { setType(val); setPage(1) }

  const goSearch = () => {
    const params = new URLSearchParams()
    if (search)    params.set('search',    search)
    if (lokasi)    params.set('lokasi',    lokasi)
    if (startDate) params.set('startDate', startDate)
    if (endDate)   params.set('endDate',   endDate)
    window.location.href = `/search?${params.toString()}`
  }

  return (
    <div className="bg-white">

      {/* ===== HERO ===== */}
      <section className="relative">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80')" }}
        />
        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#082f49]/70 via-[#0c4a6e]/55 to-[#0369a1]/65" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-32 md:pt-20 md:pb-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3.5 py-1.5 rounded-full">
              <MapPin size={12} /> Sewa kendaraan di 50+ kota di Indonesia
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mt-4 mb-3">
              Jelajahi setiap<br />sudut Indonesia.
            </h1>
            <p className="text-white/85 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Pilih kendaraan, tentukan tanggal, langsung jalan. Proses cepat, harga transparan, siap antar jemput.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a href="#kendaraan" className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-sky-900/20">
                Lihat Kendaraan <ArrowRight size={15} />
              </a>
              <Link href="/about" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
                Tentang Kami
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="relative md:absolute md:left-1/2 md:-translate-x-1/2 md:-bottom-10 w-full md:max-w-4xl px-4 -mt-20 md:mt-0 z-20">
          <div className="bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-100 flex flex-col md:flex-row overflow-visible">

            {/* Nama Kendaraan */}
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100">
              <Car size={18} className="text-[#0ea5e9] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Nama Kendaraan</p>
                <input
                  type="text"
                  placeholder="Cari mobil, motor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Lokasi */}
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 overflow-visible">
              <MapPin size={18} className="text-[#0ea5e9] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Lokasi</p>
                <CitySelector
                  value={lokasi}
                  onChange={(val) => { setLokasi(val); setPage(1) }}
                />
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100">
              <Calendar size={18} className="text-[#0ea5e9] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Tanggal Mulai</p>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => { setStartDate(e.target.value); setEndDate('') }}
                  className="w-full text-sm text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Tanggal Selesai */}
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3 border-b md:border-b-0 border-slate-100">
              <Calendar size={18} className="text-[#0ea5e9] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Tanggal Selesai</p>
                <input
                  type="date"
                  value={endDate}
                  min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full text-sm focus:outline-none bg-transparent cursor-pointer ${!startDate ? 'text-slate-300' : 'text-slate-800'}`}
                />
              </div>
            </div>

            {/* Tombol Cari */}
            <button
              onClick={goSearch}
              className="flex items-center justify-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] active:bg-[#0369a1] text-white font-bold px-6 py-3 transition-colors text-sm flex-shrink-0 w-full md:w-auto rounded-b-xl md:rounded-b-none md:rounded-r-xl"
            >
              <Search size={16} /> Cari
            </button>
          </div>

          {startDate && endDate && (
            <p className="text-center text-white md:text-slate-500 text-xs mt-3 font-medium drop-shadow">
              📅 {new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
              {' — '}
              {new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="max-w-4xl mx-auto px-4 pt-16 md:pt-24 pb-8">
        <StatsSection />
      </section>

      {/* ===== KEUNGGULAN ===== */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <span className="text-[#0ea5e9] text-xs font-semibold uppercase tracking-wide">Kenapa RentGo</span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">Kenapa Memilih Kami?</h2>
          <p className="text-slate-500 text-sm mt-2">Kami hadir untuk memudahkan setiap perjalananmu</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Shield size={20} />,     title: 'Aman & Terpercaya',  desc: 'Semua kendaraan melalui inspeksi ketat dan diasuransikan.' },
            { icon: <Clock size={20} />,      title: 'Proses Cepat',       desc: 'Booking dalam hitungan menit, kendaraan siap dalam 1 jam.' },
            { icon: <CreditCard size={20} />, title: 'Harga Transparan',   desc: 'Tidak ada biaya tersembunyi. Bayar sesuai yang tertera.' },
            { icon: <Headphones size={20} />, title: 'Support 24/7',       desc: 'Tim kami siap membantu kamu kapanpun dibutuhkan.' },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-slate-100 rounded-2xl p-5 group hover:border-[#0ea5e9]/40 hover:shadow-lg hover:shadow-sky-100 transition-all">
              <div className="w-11 h-11 bg-sky-50 text-[#0ea5e9] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== KATEGORI ===== */}
      <section className="bg-slate-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#0ea5e9] text-xs font-semibold uppercase tracking-wide">Kategori</span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">Pilih Tipe Kendaraan</h2>
            <p className="text-slate-500 text-sm mt-2">Sesuaikan dengan kebutuhan perjalananmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              { icon: <Car size={26} />, label: 'Mobil', val: 'CAR', desc: 'Cocok untuk perjalanan keluarga, bisnis, atau jarak jauh dengan kenyamanan penuh.', tags: ['MPV', 'SUV', 'Sedan'], color: 'sky' },
              { icon: <Bike size={26} />, label: 'Motor', val: 'MOTORCYCLE', desc: 'Lincah di jalanan kota, hemat BBM, dan mudah menembus kemacetan.', tags: ['Matic', 'Manual', 'Sport'], color: 'blue' },
            ].map((c) => (
              <button key={c.val} onClick={() => { handleTypeChange(c.val as VehicleType); document.getElementById('kendaraan')?.scrollIntoView({ behavior: 'smooth' }) }} className="relative overflow-hidden text-left bg-white border border-slate-100 hover:border-[#0ea5e9]/40 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1 transition-all group cursor-pointer flex flex-col gap-3.5 rounded-2xl p-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.color === 'sky' ? 'bg-sky-50 text-[#0ea5e9]' : 'bg-blue-50 text-blue-600'}`}>{c.icon}</div>
                <div>
                  <p className="font-bold text-slate-900 text-base">{c.label}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {c.tags.map((tag) => (<span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.color === 'sky' ? 'bg-sky-50 text-[#0369a1]' : 'bg-blue-50 text-blue-700'}`}>{tag}</span>))}
                </div>
                <ArrowRight className="absolute bottom-4 right-4 text-slate-200 group-hover:text-[#0ea5e9] group-hover:translate-x-1 transition-all" size={18} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DAFTAR KENDARAAN ===== */}
      <section id="kendaraan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <span className="text-[#0ea5e9] text-xs font-semibold uppercase tracking-wide">Armada Kami</span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">Kendaraan Tersedia</h2>
            <p className="text-slate-500 text-sm mt-1">Semua kendaraan siap disewa hari ini</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-400"><SlidersHorizontal size={15} /> Filter:</span>
            {VEHICLE_TYPES.map((t) => (
              <button key={t.value} onClick={() => handleTypeChange(t.value)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${type === t.value ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0ea5e9]/50 hover:text-[#0ea5e9]'}`}>
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
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-white border border-slate-200 hover:border-[#0ea5e9] hover:text-[#0ea5e9] text-slate-500 py-2 px-3 rounded-xl disabled:opacity-40 transition-all"><ChevronLeft size={16} /></button>
                <span className="text-sm text-slate-500 font-medium">Halaman {page} dari {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white border border-slate-200 hover:border-[#0ea5e9] hover:text-[#0ea5e9] text-slate-500 py-2 px-3 rounded-xl disabled:opacity-40 transition-all"><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===== CARA SEWA ===== */}
      <section className="bg-slate-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#0ea5e9] text-xs font-semibold uppercase tracking-wide">Mudah & Cepat</span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">Cara Sewa Kendaraan</h2>
            <p className="text-slate-500 text-sm mt-2">Hanya 3 langkah, langsung jalan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Pilih Kendaraan',    desc: 'Cari dan pilih kendaraan yang sesuai kebutuhanmu dari ratusan pilihan.' },
              { step: '02', title: 'Tentukan Tanggal',   desc: 'Pilih tanggal mulai dan selesai. Estimasi harga langsung tampil otomatis.' },
              { step: '03', title: 'Nikmati Perjalanan', desc: 'Konfirmasi pemesanan dan kendaraan siap diantar ke lokasimu.' },
            ].map((s) => (
              <div key={s.step} className="bg-white border border-slate-100 rounded-2xl p-6 text-center hover:shadow-lg hover:shadow-sky-100 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#0ea5e9] text-white flex items-center justify-center mx-auto mb-3 text-base font-bold">{s.step}</div>
                <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="relative bg-gradient-to-br from-[#0369a1] to-[#0ea5e9] rounded-3xl px-8 py-12 text-center overflow-hidden">
          <div className="absolute top-[-60px] right-[-40px] w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute bottom-[-80px] left-[-30px] w-56 h-56 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h2 className="text-xl md:text-3xl font-extrabold text-white mb-3">Siap Memulai Perjalanan?</h2>
            <p className="text-white/85 text-sm mb-7 max-w-md mx-auto">Daftar sekarang dan nikmati kemudahan sewa kendaraan kapan saja, di mana saja.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/register" className="bg-white text-[#0369a1] font-bold px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors text-sm inline-flex items-center gap-2">Daftar Gratis <ArrowRight size={15} /></Link>
              <Link href="/login" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm">Masuk Sekarang</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}