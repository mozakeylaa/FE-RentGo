'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Car, Bike } from 'lucide-react'
import toast from 'react-hot-toast'
import { vehicleApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import type { Vehicle, VehicleType } from '@/types'
import VehicleCard from '@/components/VehicleCard'
import EmptyState from '@/components/EmptyState'
import SkeletonCard from '@/components/SkeletonCard'

const VEHICLE_TYPES: { value: VehicleType | ''; label: string; icon?: React.ReactNode }[] = [
  { value: '',           label: 'Semua',  icon: <SlidersHorizontal size={14} /> },
  { value: 'CAR',        label: 'Mobil',  icon: <Car size={14} /> },
  { value: 'MOTORCYCLE', label: 'Motor',  icon: <Bike size={14} /> },
]

export default function VehiclesPage() {
  const [vehicles, setVehicles]     = useState<Vehicle[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [debounced, setDebounced]   = useState('')
  const [type, setType]             = useState<VehicleType | ''>('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(1) }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...(debounced ? { search: debounced } : { status: 'AVAILABLE' as const }),
        ...(type ? { type } : {}),
        page,
        limit: 12,
      }
      const res = await vehicleApi.getAll(params)
      setVehicles(res.items)
      setTotalPages(res.meta.totalPages)
      setTotal(res.meta.total ?? 0)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [debounced, type, page])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const handleTypeChange = (val: VehicleType | '') => { setType(val); setPage(1) }

  return (
    <div className="bg-[#080f1a] min-h-screen text-white">

      {/* ===== HEADER ===== */}
      <section className="relative pt-14 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080f1a]/80 to-[#080f1a]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/25 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 text-[#4ade80]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block" />
            Semua Kendaraan
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-white">Temukan Kendaraan <span className="text-[#4ade80]">Impianmu</span></h1>
          <p className="text-white/40 text-sm mb-8 max-w-xl">Pilih dari ratusan kendaraan tersedia. Filter sesuai kebutuhanmu.</p>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#4ade80]/40 transition-all">
              <Search size={16} className="text-white/30 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari nama kendaraan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
              />
            </div>

            {/* Filter Tipe */}
            <div className="flex gap-2">
              {VEHICLE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-semibold border transition-all ${
                    type === t.value
                      ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/80'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HASIL ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Info jumlah */}
        {!loading && (
          <p className="text-sm text-white/30 mb-5">
            Menampilkan <span className="text-white font-semibold">{vehicles.length}</span> dari <span className="text-white font-semibold">{total}</span> kendaraan
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState title="Kendaraan tidak ditemukan" description="Coba ubah kata kunci atau filter pencarian." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 py-2 px-3 rounded-xl disabled:opacity-40 transition-all">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-white/50 font-medium">Halaman {page} dari {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 py-2 px-3 rounded-xl disabled:opacity-40 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}