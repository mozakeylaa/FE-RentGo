'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Loader2, Calendar, Tag, MapPin, Info,
  Car, AlertCircle, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { vehicleApi, rentalApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { formatRupiah } from '@/lib/format'
import type { Vehicle, VehicleImage } from '@/types'
import ReviewList from '@/components/ReviewList'

const statusStyle: Record<string, string> = {
  AVAILABLE: 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/25',
  RENTED: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25',
  MAINTENANCE: 'bg-white/10 text-white/50 border border-white/15',
}
const statusLabel: Record<string, string> = {
  AVAILABLE: 'Tersedia',
  RENTED: 'Sedang Disewa',
  MAINTENANCE: 'Dalam Perawatan',
}
const typeLabel: Record<string, string> = {
  CAR: 'Mobil', MOTORCYCLE: 'Motor',
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isAdmin } = useAuth()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ── Galeri ──
  const [images, setImages] = useState<VehicleImage[]>([])
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(searchParams.get('startDate') ?? '')
  const [endDate, setEndDate] = useState(searchParams.get('endDate') ?? '')
  const [note, setNote] = useState('')

  useEffect(() => {
    const sDate = searchParams.get('startDate')
    const eDate = searchParams.get('endDate')
    if (sDate) setStartDate(sDate)
    if (eDate) setEndDate(eDate)
  }, [searchParams])

  const diffDays = (() => {
    if (!startDate || !endDate) return 0
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime()
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
  })()
  const estimatedTotal = vehicle ? diffDays * vehicle.pricePerDay : 0

  const dateError = startDate && endDate && endDate <= startDate
    ? 'Tanggal selesai harus setelah tanggal mulai'
    : ''

  useEffect(() => {
    if (!id) return
    vehicleApi.getOne(id)
      .then((v) => {
        setVehicle(v)
        setActiveImg(v.imageUrl ?? null)
      })
      .catch(() => toast.error('Kendaraan tidak ditemukan'))
      .finally(() => setLoading(false))

    vehicleApi.getImages(id)
      .then((imgs) => setImages(imgs))
      .catch(() => { })
  }, [id])

  const handleSewa = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!startDate || !endDate || dateError) {
      toast.error('Lengkapi tanggal sewa dengan benar'); return
    }
    setSubmitting(true)
    try {
      await rentalApi.create({ vehicleId: id, startDate, endDate, note })
      toast.success('Sewa berhasil dibuat!')
      router.push('/my-rentals')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const allImages = [
    ...(vehicle?.imageUrl ? [{ id: 'main', url: vehicle.imageUrl, publicId: '', order: -1 }] : []),
    ...images,
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#4ade80]" size={32} />
          <p className="text-sm text-white/40">Memuat detail kendaraan...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-white">Kendaraan tidak ditemukan</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 bg-[#4ade80] text-[#080f1a] font-bold px-5 py-2.5 rounded-xl text-sm">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </div>
    )
  }

  const isAvailable = vehicle.status === 'AVAILABLE'
  const canBook = isAvailable && !isAdmin

  const inputClass = `w-full bg-white/5 border border-white/10 focus:border-[#4ade80]/40 focus:bg-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed`

  const currentIdx = allImages.findIndex((img) => img.url === activeImg)

  return (
    <div className="min-h-screen bg-[#080f1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#4ade80] mb-6 transition-colors">
          <ArrowLeft size={16} /> Kembali ke daftar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ---- Kiri ---- */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Foto Utama ── */}
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-white/5 cursor-pointer group"
              onClick={() => setLightbox(activeImg ?? vehicle.imageUrl ?? null)}
            >
              <img
                src={activeImg || vehicle.imageUrl || `https://placehold.co/800x400/0f1f2e/4ade80?text=${encodeURIComponent(vehicle.name)}`}
                alt={vehicle.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#93c5fd]/10 text-[#93c5fd] border border-[#93c5fd]/25">
                  {typeLabel[vehicle.type] ?? vehicle.type}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[vehicle.status] ?? statusStyle.MAINTENANCE}`}>
                  {statusLabel[vehicle.status] ?? vehicle.status}
                </span>
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImg(allImages[Math.max(0, currentIdx - 1)].url) }}
                    disabled={currentIdx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImg(allImages[Math.min(allImages.length - 1, currentIdx + 1)].url) }}
                    disabled={currentIdx === allImages.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                    {currentIdx + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* ── Thumbnail Galeri ── */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(img.url)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === img.url
                        ? 'border-[#4ade80] scale-105'
                        : 'border-white/10 hover:border-white/30'
                      }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Judul + Harga */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-white">{vehicle.name}</h1>
                  <p className="text-white/40 text-sm mt-1">{vehicle.brand} {vehicle.model} · {vehicle.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-[#4ade80]">{formatRupiah(vehicle.pricePerDay)}</p>
                  <p className="text-xs text-white/30">per hari</p>
                </div>
              </div>
              {vehicle.description && (
                <p className="text-sm text-white/40 mt-4 leading-relaxed border-t border-white/[0.06] pt-4">
                  {vehicle.description}
                </p>
              )}
            </div>

            {/* Spesifikasi */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-5">Spesifikasi</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Car size={15} />, label: 'Tipe', value: typeLabel[vehicle.type] ?? vehicle.type },
                  { icon: <Tag size={15} />, label: 'Merek', value: vehicle.brand },
                  { icon: <Info size={15} />, label: 'Model', value: vehicle.model },
                  { icon: <Calendar size={15} />, label: 'Tahun', value: String(vehicle.year) },
                  { icon: <MapPin size={15} />, label: 'Plat Nomor', value: vehicle.plateNumber },
                  { icon: <Info size={15} />, label: 'Status', value: statusLabel[vehicle.status] ?? vehicle.status },
                  ...(vehicle.location ? [{ icon: <MapPin size={15} />, label: 'Lokasi', value: vehicle.location }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <span className="text-[#4ade80] mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-xs text-white/30">{item.label}</p>
                      <p className="text-sm font-medium text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Rating & Review ── */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-5">Rating & Review</h2>
              <ReviewList vehicleId={id} />
            </div>

          </div>

          {/* ---- Kanan: Panel Sewa ---- */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sticky top-24 space-y-4">
              <h2 className="font-semibold text-white text-lg">Form Sewa</h2>

              {!isAvailable && (
                <div className="flex items-start gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">
                    Kendaraan ini sedang <strong>{statusLabel[vehicle.status]}</strong> dan tidak dapat disewa saat ini.
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
                  <Info size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-400">Anda login sebagai Admin. Fitur sewa tidak tersedia untuk Admin.</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Tanggal Mulai</label>
                  <input type="date" min={today} value={startDate} onChange={(e) => { setStartDate(e.target.value); setEndDate('') }} disabled={!canBook} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Tanggal Selesai</label>
                  <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!canBook || !startDate} className={inputClass} />
                  {dateError && <p className="text-red-400 text-xs mt-1.5">{dateError}</p>}
                </div>
                {/* ── Keterangan / Note ── */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">Keterangan (Opsional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={!canBook}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Contoh: Tolong siapkan 2 helm ya..."
                  />
                </div>
              </div>

              {diffDays > 0 && !dateError && (
                <div className="bg-[#4ade80]/5 border border-[#4ade80]/15 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Durasi</span>
                    <span className="font-semibold text-white">{diffDays} hari</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Harga/hari</span>
                    <span className="font-semibold text-white">{formatRupiah(vehicle.pricePerDay)}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                    <span className="text-sm font-semibold text-white/60">Estimasi Total</span>
                    <span className="font-extrabold text-[#4ade80]">{formatRupiah(estimatedTotal)}</span>
                  </div>
                  <p className="text-xs text-white/25 text-center">*Harga final dikonfirmasi server</p>
                </div>
              )}

              {!isAdmin && (
                <button
                  onClick={handleSewa}
                  disabled={!canBook || submitting || !!dateError || !startDate || !endDate}
                  className="w-full flex items-center justify-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] active:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed text-[#080f1a] font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                    : !isAuthenticated
                      ? <><ShoppingCart size={16} /> Login untuk Menyewa</>
                      : <><ShoppingCart size={16} /> Sewa Sekarang</>
                  }
                </button>
              )}

              <div className="text-center text-xs text-white/25 pt-1">
                Mulai dari <span className="font-semibold text-[#4ade80]">{formatRupiah(vehicle.pricePerDay)}</span>/hari
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 rounded-full p-2">
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}