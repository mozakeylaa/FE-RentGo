'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Calendar, Car, RefreshCw, CreditCard, FileText, Star, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { rentalApi, reviewApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Rental } from '@/types'
import Loader from '@/components/Loader'
import EmptyState from '@/components/EmptyState'
import ReviewForm from '@/components/ReviewForm'

const statusStyle: Record<string, string> = {
  PENDING:   'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25',
  CONFIRMED: 'bg-[#93c5fd]/10 text-[#93c5fd] border border-[#93c5fd]/25',
  ONGOING:   'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/25',
  COMPLETED: 'bg-white/5 text-white/40 border border-white/15',
  CANCELLED: 'bg-red-400/10 text-red-400 border border-red-400/25',
}
const statusLabel: Record<string, string> = {
  PENDING:   'Menunggu Pembayaran',
  CONFIRMED: 'Dikonfirmasi',
  ONGOING:   'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

export default function MyRentalsPage() {
  const [rentals, setRentals]               = useState<Rental[]>([])
  const [loading, setLoading]               = useState(true)
  const [reviewedIds, setReviewedIds]       = useState<Set<string>>(new Set())
  const [openReviewId, setOpenReviewId]     = useState<string | null>(null)
  const [cancellingId, setCancellingId]     = useState<string | null>(null)
  const [cancelTarget, setCancelTarget]     = useState<Rental | null>(null)

  const fetchRentals = async () => {
    setLoading(true)
    try {
      const data = await rentalApi.getAll()
      setRentals(Array.isArray(data) ? data : (data as any)?.items ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchMyReviews = async () => {
    try {
      const data = await reviewApi.getMy()
      const ids = new Set((Array.isArray(data) ? data : []).map((r: any) => r.rentalId))
      setReviewedIds(ids)
    } catch { }
  }

  useEffect(() => {
    fetchRentals()
    fetchMyReviews()
  }, [])

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancellingId(cancelTarget.id)
    try {
      await rentalApi.cancel(cancelTarget.id)
      toast.success('Pesanan berhasil dibatalkan!')
      setCancelTarget(null)
      fetchRentals()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#080f1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Sewa Saya</h1>
            <p className="text-white/40 text-sm mt-0.5">Riwayat & status sewa kendaraanmu</p>
          </div>
          <button
            onClick={() => { fetchRentals(); fetchMyReviews() }}
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/50 hover:text-white p-2.5 rounded-xl transition-all"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : rentals.length === 0 ? (
          <div className="text-center py-20">
            <EmptyState title="Belum ada sewa" description="Kamu belum pernah menyewa kendaraan." />
            <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-[#080f1a] font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Car size={16} /> Jelajahi Kendaraan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => {
              const payment = rental.payment
              const hasUploadedProof  = payment?.proofStatus === 'PENDING_REVIEW'
              const hasPaymentNoProof = payment != null && !hasUploadedProof && payment.status !== 'PAID'

              return (
                <div key={rental.id} className="bg-white/[0.04] border border-white/10 hover:border-[#4ade80]/20 hover:bg-white/[0.06] transition-all rounded-2xl p-5 space-y-4">

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Gambar */}
                    <div className="w-full sm:w-24 h-36 sm:h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img
                        src={rental.vehicle?.imageUrl || `https://placehold.co/200x120/0f1f2e/4ade80?text=${encodeURIComponent(rental.vehicle?.name ?? 'Kendaraan')}`}
                        alt={rental.vehicle?.name ?? 'Kendaraan'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-base truncate">
                            {rental.vehicle?.name ?? '—'}
                          </h3>
                          <p className="text-xs text-white/35 mt-0.5">
                            {rental.vehicle?.brand} · {rental.vehicle?.plateNumber}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusStyle[rental.status] ?? statusStyle.COMPLETED}`}>
                          {statusLabel[rental.status] ?? rental.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-white/40">
                        <Calendar size={14} className="text-[#4ade80]" />
                        <span>{formatDate(rental.startDate)} – {formatDate(rental.endDate)}</span>
                      </div>
                    </div>

                    {/* Harga + Tombol */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-white/[0.06] flex-shrink-0">
                      <p className="text-lg font-bold text-[#4ade80]">
                        {formatRupiah(rental.totalPrice)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap justify-end">

                        {rental.status === 'PENDING' && !payment && (
                          <Link href={`/payment/${rental.id}`}
                            className="flex items-center gap-1.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#080f1a] font-bold text-xs px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap">
                            <CreditCard size={12} /> Bayar Sekarang
                          </Link>
                        )}

                        {rental.status === 'PENDING' && hasPaymentNoProof && (
                          <Link href={`/payment/${rental.id}`}
                            className="flex items-center gap-1.5 bg-[#4ade80] hover:bg-[#22c55e] text-[#080f1a] font-bold text-xs px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap">
                            <CreditCard size={12} /> Lanjut Bayar
                          </Link>
                        )}

                        {rental.status === 'CONFIRMED' && (
                          <Link href={`/payment/${rental.id}`}
                            className="flex items-center gap-1.5 text-xs text-[#93c5fd] border border-[#93c5fd]/30 hover:bg-[#93c5fd]/10 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap">
                            <FileText size={12} /> Lihat Pembayaran
                          </Link>
                        )}

                        {['ONGOING', 'COMPLETED'].includes(rental.status) && (
                          <Link href={`/invoice/${rental.id}`}
                            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#4ade80] border border-white/10 hover:border-[#4ade80]/30 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap">
                            <FileText size={12} /> Lihat Invoice
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Bottom bar ── */}
                  <div className="border-t border-white/[0.06] pt-4">

                    {rental.status === 'PENDING' && !payment && (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs text-yellow-400/70 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block animate-pulse" />
                          Silakan lakukan pembayaran untuk melanjutkan pesanan
                        </p>
                        <button
                          onClick={() => setCancelTarget(rental)}
                          className="flex items-center gap-1.5 text-xs text-red-400 border border-red-400/25 hover:bg-red-400/10 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
                        >
                          <XCircle size={12} /> Batalkan Pesanan
                        </button>
                      </div>
                    )}

                    {rental.status === 'PENDING' && hasPaymentNoProof && (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs text-yellow-400/70 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block animate-pulse" />
                          Silakan upload bukti pembayaran
                        </p>
                        <button
                          onClick={() => setCancelTarget(rental)}
                          className="flex items-center gap-1.5 text-xs text-red-400 border border-red-400/25 hover:bg-red-400/10 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
                        >
                          <XCircle size={12} /> Batalkan Pesanan
                        </button>
                      </div>
                    )}

                    {rental.status === 'PENDING' && hasUploadedProof && (
                      <p className="text-xs text-yellow-400/70 flex items-center gap-1.5">
                        <Clock size={13} className="text-yellow-400" />
                        Bukti pembayaran sedang direview admin. Mohon tunggu konfirmasi.
                      </p>
                    )}

                    {rental.status === 'CONFIRMED' && (
                      <p className="text-xs text-[#93c5fd]/70 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#93c5fd] inline-block animate-pulse" />
                        Pembayaran dikonfirmasi admin. Sewa sedang diproses.
                      </p>
                    )}

                    {rental.status === 'ONGOING' && (
                      <p className="text-xs text-[#4ade80]/70 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block animate-pulse" />
                        Sewa sedang berlangsung. Selamat menikmati perjalanan!
                      </p>
                    )}

                    {rental.status === 'COMPLETED' && (
                      reviewedIds.has(rental.id) ? (
                        <div className="flex items-center gap-2 text-sm text-white/30">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          Kamu sudah memberikan review untuk sewa ini
                        </div>
                      ) : openReviewId === rental.id ? (
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                          <h4 className="text-sm font-semibold text-white">Tulis Review</h4>
                          <ReviewForm
                            rentalId={rental.id}
                            onSuccess={() => {
                              setOpenReviewId(null)
                              setReviewedIds((prev) => new Set([...prev, rental.id]))
                              toast.success('Review berhasil dikirim!')
                            }}
                          />
                          <button onClick={() => setOpenReviewId(null)}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors">
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setOpenReviewId(rental.id)}
                          className="flex items-center gap-1.5 text-xs text-amber-400 border border-amber-400/25 hover:bg-amber-400/10 px-3 py-1.5 rounded-xl transition-all">
                          <Star size={13} /> Beri Review
                        </button>
                      )
                    )}

                    {rental.status === 'CANCELLED' && (
                      <p className="text-xs text-red-400/60 flex items-center gap-1.5">
                        <XCircle size={13} /> Pesanan ini telah dibatalkan
                      </p>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal Konfirmasi Batalkan ── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelTarget(null)} />
          <div className="relative bg-[#0f1f2e] border border-white/10 rounded-2xl w-full max-w-sm p-6 z-10 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                <AlertTriangle size={26} className="text-red-400" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">Batalkan Pesanan?</p>
                <p className="text-sm text-white/40 mt-1">
                  Pesanan <span className="text-white font-semibold">{cancelTarget.vehicle?.name}</span> akan dibatalkan dan tidak bisa dikembalikan.
                </p>
              </div>
              <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-left">
                <p className="text-xs text-white/40 mb-1">Detail pesanan</p>
                <p className="text-sm font-semibold text-white">{cancelTarget.vehicle?.name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {formatDate(cancelTarget.startDate)} – {formatDate(cancelTarget.endDate)}
                </p>
                <p className="text-sm font-bold text-red-400 mt-1">{formatRupiah(cancelTarget.totalPrice)}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={!!cancellingId}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Tidak, Kembali
              </button>
              <button
                onClick={handleCancel}
                disabled={!!cancellingId}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {cancellingId
                  ? <><Loader2 size={14} className="animate-spin" /> Membatalkan...</>
                  : <><XCircle size={14} /> Ya, Batalkan</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}