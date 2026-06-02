'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
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

function SearchContent() {
  const searchParams = useSearchParams()

  const initSearch    = searchParams.get('search')    ?? ''
  const initLokasi    = searchParams.get('lokasi')    ?? ''   // ← fix: baca param lokasi
  const initStartDate = searchParams.get('startDate') ?? ''
  const initEndDate   = searchParams.get('endDate')   ?? ''
  const initType      = (searchParams.get('type')     ?? '') as VehicleType | ''
  const initCategory  = searchParams.get('category')  ?? ''

  const [vehicles, setVehicles]     = useState<Vehicle[]>([])
  const [loading, setLoading]       = useState(true)
  const [type, setType]             = useState<VehicleType | ''>(initType)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...(initSearch   ? { search: initSearch }       : {}),
        ...(initCategory ? { category: initCategory }   : {}),
        ...(initLokasi   ? { location: initLokasi }     : {}),  // ← fix: kirim location
        ...(type         ? { type }                     : {}),
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
  }, [initSearch, initCategory, initLokasi, type, page])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const handleTypeChange = (val: VehicleType | '') => {
    setType(val)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#080f1a]">

      {/* Header */}
      <div className="bg-[#080f1a] border-b border-white/[0.06] text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-60px] w-[280px] h-[280px] rounded-full bg-[#4ade80] opacity-[0.04] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-[#4ade80] text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Hasil Pencarian</h1>

          <div className="flex flex-wrap gap-2 text-sm">
            {initSearch && (
              <span className="bg-[#4ade80]/10 border border-[#4ade80]/25 text-[#4ade80] rounded-full px-3 py-1 font-medium">
                "{initSearch}"
              </span>
            )}
            {initLokasi && (
              <span className="bg-[#4ade80]/10 border border-[#4ade80]/25 text-[#4ade80] rounded-full px-3 py-1 font-medium">
                📍 {initLokasi}
              </span>
            )}
            {initCategory && (
              <span className="bg-[#4ade80]/10 border border-[#4ade80]/25 text-[#4ade80] rounded-full px-3 py-1 font-medium">
                {initCategory}
              </span>
            )}
            {initStartDate && initEndDate && (
              <span className="bg-white/5 border border-white/10 text-white/50 rounded-full px-3 py-1">
                {new Date(initStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                {' — '}
                {new Date(initEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm font-medium text-white/50">
            <SlidersHorizontal size={16} /> Filter:
          </span>
          {VEHICLE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                type === t.value
                  ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40'
                  : 'bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-10">
            <EmptyState
              title="Kendaraan tidak ditemukan"
              description="Coba ubah kata kunci atau filter pencarian."
            />
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-[#080f1a] font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Kembali ke Home
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/30 mb-4">
              Menampilkan <span className="font-semibold text-white/60">{vehicles.length}</span> kendaraan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  startDate={initStartDate}
                  endDate={initEndDate}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 py-2 px-3 rounded-xl disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-white/50 font-medium">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 py-2 px-3 rounded-xl disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center">
        <p className="text-white/40 text-sm">Memuat pencarian...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}