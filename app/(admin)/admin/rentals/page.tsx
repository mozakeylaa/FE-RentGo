'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, Loader2, ChevronLeft, ChevronRight, X, CheckCircle, XCircle, Flag } from 'lucide-react'
import { rentalApi, paymentApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Rental, RentalStatus, PaginationMeta } from '@/types'
import Loader from '@/components/Loader'
import EmptyState from '@/components/EmptyState'

const STATUS_OPTIONS: { value: RentalStatus | ''; label: string }[] = [
  { value: '',           label: 'Semua Status' },
  { value: 'PENDING',    label: 'Menunggu' },
  { value: 'CONFIRMED',  label: 'Dikonfirmasi' },
  { value: 'ONGOING',    label: 'Berlangsung' },
  { value: 'COMPLETED',  label: 'Selesai' },
  { value: 'CANCELLED',  label: 'Dibatalkan' },
]

const NEXT_STATUSES: Partial<Record<RentalStatus, RentalStatus[]>> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ONGOING',   'CANCELLED'],
}

const statusBadge: Record<string, string> = {
  PENDING:   'badge-yellow',
  CONFIRMED: 'badge-blue',
  ONGOING:   'badge-green',
  COMPLETED: 'badge-gray',
  CANCELLED: 'badge-red',
}
const statusLabel: Record<string, string> = {
  PENDING:   'Menunggu',
  CONFIRMED: 'Dikonfirmasi',
  ONGOING:   'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
}
const proofStatusBadge: Record<string, string> = {
  PENDING_REVIEW: 'badge-yellow',
  REJECTED:       'badge-red',
  APPROVED:       'badge-green',
}
const proofStatusLabel: Record<string, string> = {
  PENDING_REVIEW: 'Review Bukti',
  REJECTED:       'Ditolak',
  APPROVED:       'Disetujui',
}

const LIMIT = 10

export default function AdminRentalsPage() {
  const [rentals, setRentals]             = useState<Rental[]>([])
  const [meta, setMeta]                   = useState<PaginationMeta | null>(null)
  const [loading, setLoading]             = useState(true)
  const [filterStatus, setFilterStatus]   = useState<RentalStatus | ''>('')
  const [page, setPage]                   = useState(1)
  const [proofModal, setProofModal]       = useState<Rental | null>(null)
  const [confirming, setConfirming]       = useState(false)
  const [rejecting, setRejecting]         = useState(false)
  const [completingId, setCompletingId]   = useState<string | null>(null)
  const [completeModal, setCompleteModal] = useState<Rental | null>(null)
  const [updatingId, setUpdatingId]       = useState<string | null>(null)

  const fetchRentals = async (p = page) => {
    setLoading(true)
    try {
      const res = await rentalApi.getAllPaginated({
        ...(filterStatus ? { status: filterStatus } : {}),
        page: p,
        limit: LIMIT,
      })
      setRentals(res.items)
      setMeta(res.meta)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1); fetchRentals(1) }, [filterStatus])
  useEffect(() => { fetchRentals(page) }, [page])

  const handleStatusChange = async (id: string, newStatus: RentalStatus) => {
    setUpdatingId(id)
    try {
      await rentalApi.updateStatus(id, newStatus)
      toast.success(`Status diubah ke "${statusLabel[newStatus]}"`)
      fetchRentals(page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleConfirmProof = async () => {
    if (!proofModal) return
    const payment = (proofModal as any).payment
    if (!payment) return
    setConfirming(true)
    try {
      await paymentApi.confirmPayment(payment.id)
      toast.success('Bukti dikonfirmasi! Payment PAID & invoice digenerate.')
      setProofModal(null)
      fetchRentals(page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setConfirming(false)
    }
  }

  const handleRejectProof = async () => {
    if (!proofModal) return
    const payment = (proofModal as any).payment
    if (!payment) return
    setRejecting(true)
    try {
      await paymentApi.rejectPayment(payment.id)
      toast.success('Bukti ditolak, user perlu upload ulang.')
      setProofModal(null)
      fetchRentals(page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRejecting(false)
    }
  }

  const handleComplete = async () => {
    if (!completeModal) return
    setCompletingId(completeModal.id)
    try {
      await rentalApi.complete(completeModal.id)
      toast.success('Sewa diselesaikan! Kendaraan kembali tersedia.')
      setCompleteModal(null)
      fetchRentals(page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Pesanan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {meta ? `${meta.total} pesanan ditemukan` : `${rentals.length} pesanan ditemukan`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RentalStatus | '')}
            className="input-field w-auto py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => fetchRentals(page)} className="btn-secondary py-2 px-3">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : rentals.length === 0 ? (
        <EmptyState title="Tidak ada pesanan" description="Belum ada pesanan dengan status ini." />
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden lg:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Penyewa', 'Kendaraan', 'Tanggal', 'Total', 'Bukti', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rentals.map((r) => {
                  const payment   = (r as any).payment
                  const hasProof  = payment?.proofUrl && payment?.status !== 'PAID'
                  const nextOpts  = NEXT_STATUSES[r.status] ?? []
                  const isUpdating = updatingId === r.id

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">{r.user?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{r.user?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">{r.vehicle?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{r.vehicle?.plateNumber ?? ''}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-xs">
                        <p>{formatDate(r.startDate)}</p>
                        <p className="text-slate-400">s/d {formatDate(r.endDate)}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-primary-600">
                        {formatRupiah(r.totalPrice)}
                      </td>
                      <td className="px-4 py-4">
                        {hasProof ? (
                          <button
                            onClick={() => setProofModal(r)}
                            className={`${proofStatusBadge[payment.proofStatus] ?? 'badge-gray'} cursor-pointer hover:opacity-75 transition-opacity`}
                          >
                            {proofStatusLabel[payment.proofStatus] ?? payment.proofStatus}
                          </button>
                        ) : payment?.proofStatus ? (
                          <span className={proofStatusBadge[payment.proofStatus] ?? 'badge-gray'}>
                            {proofStatusLabel[payment.proofStatus] ?? payment.proofStatus}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={statusBadge[r.status] ?? 'badge-gray'}>
                          {statusLabel[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          {/* Tombol ubah status */}
                          {isUpdating ? (
                            <Loader2 size={14} className="animate-spin text-primary-500" />
                          ) : nextOpts.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(r.id, s)}
                              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                                s === 'CANCELLED'
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-primary-200 text-primary-600 hover:bg-primary-50'
                              }`}
                            >
                              → {statusLabel[s]}
                            </button>
                          ))}

                          {/* Tombol selesaikan — hanya ONGOING */}
                          {r.status === 'ONGOING' && (
                            <button
                              onClick={() => setCompleteModal(r)}
                              disabled={completingId === r.id}
                              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {completingId === r.id
                                ? <><Loader2 size={11} className="animate-spin" /> Proses...</>
                                : <><Flag size={11} /> Selesaikan</>
                              }
                            </button>
                          )}

                          {/* Final */}
                          {nextOpts.length === 0 && r.status !== 'ONGOING' && (
                            <span className="text-xs text-slate-300 italic">Final</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Kartu Mobile */}
          <div className="lg:hidden space-y-3">
            {rentals.map((r) => {
              const payment    = (r as any).payment
              const hasProof   = payment?.proofUrl && payment?.status !== 'PAID'
              const nextOpts   = NEXT_STATUSES[r.status] ?? []
              const isUpdating = updatingId === r.id

              return (
                <div key={r.id} className="card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{r.user?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{r.user?.email}</p>
                    </div>
                    <span className={statusBadge[r.status] ?? 'badge-gray'}>
                      {statusLabel[r.status]}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                    <p><span className="text-slate-400">Kendaraan:</span> {r.vehicle?.name ?? '—'}</p>
                    <p><span className="text-slate-400">Plat:</span> {r.vehicle?.plateNumber ?? '—'}</p>
                    <p><span className="text-slate-400">Mulai:</span> {formatDate(r.startDate)}</p>
                    <p><span className="text-slate-400">Selesai:</span> {formatDate(r.endDate)}</p>
                    <p><span className="text-slate-400">Total:</span>{' '}
                      <span className="font-semibold text-primary-600">{formatRupiah(r.totalPrice)}</span>
                    </p>
                    {payment?.proofStatus && (
                      <p><span className="text-slate-400">Bukti:</span>{' '}
                        <span className={proofStatusBadge[payment.proofStatus]}>
                          {proofStatusLabel[payment.proofStatus]}
                        </span>
                      </p>
                    )}
                  </div>

                  {hasProof && (
                    <button
                      onClick={() => setProofModal(r)}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded-xl transition-colors"
                    >
                      Lihat & Review Bukti Pembayaran
                    </button>
                  )}

                  {/* Tombol ubah status */}
                  {isUpdating ? (
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <Loader2 size={14} className="animate-spin" /> Memperbarui...
                    </div>
                  ) : nextOpts.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {nextOpts.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(r.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                            s === 'CANCELLED'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-primary-200 text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          → {statusLabel[s]}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tombol selesaikan */}
                  {r.status === 'ONGOING' && (
                    <button
                      onClick={() => setCompleteModal(r)}
                      disabled={completingId === r.id}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {completingId === r.id
                        ? <><Loader2 size={14} className="animate-spin" /> Menyelesaikan...</>
                        : <><Flag size={14} /> Selesaikan Sewa</>
                      }
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-500">
                Halaman {meta.page} dari {meta.totalPages} · {meta.total} data
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-3 disabled:opacity-40">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                      page === p ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-secondary py-2 px-3 disabled:opacity-40">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal Lihat Bukti ── */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProofModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Bukti Pembayaran</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {proofModal.user?.name} · {proofModal.vehicle?.name} · {formatRupiah(proofModal.totalPrice)}
                </p>
              </div>
              <button onClick={() => setProofModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 mb-5">
              <img
                src={(proofModal as any).payment?.proofUrl}
                alt="Bukti pembayaran"
                className="w-full max-h-72 object-contain bg-slate-50"
              />
            </div>
            {(proofModal as any).payment?.proofStatus === 'PENDING_REVIEW' && (
              <div className="flex gap-3">
                <button
                  onClick={handleRejectProof}
                  disabled={rejecting || confirming}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {rejecting
                    ? <><Loader2 size={15} className="animate-spin" /> Menolak...</>
                    : <><XCircle size={15} /> Tolak</>
                  }
                </button>
                <button
                  onClick={handleConfirmProof}
                  disabled={confirming || rejecting}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {confirming
                    ? <><Loader2 size={15} className="animate-spin" /> Mengkonfirmasi...</>
                    : <><CheckCircle size={15} /> Konfirmasi</>
                  }
                </button>
              </div>
            )}
            {(proofModal as any).payment?.proofStatus !== 'PENDING_REVIEW' && (
              <p className="text-center text-sm text-slate-400">
                Bukti ini sudah <strong>{proofStatusLabel[(proofModal as any).payment?.proofStatus] ?? '—'}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Selesaikan Sewa ── */}
      {completeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCompleteModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-sm p-6 z-10">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Flag size={26} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Selesaikan Sewa?</p>
                <p className="text-sm text-slate-500 mt-1">
                  Sewa <span className="font-semibold text-slate-700">{completeModal.vehicle?.name}</span> oleh{' '}
                  <span className="font-semibold text-slate-700">{completeModal.user?.name}</span> akan ditandai selesai dan kendaraan kembali tersedia.
                </p>
              </div>
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-left">
                <p className="text-xs text-slate-400 mb-1">Detail sewa</p>
                <p className="text-sm font-semibold text-slate-800">{completeModal.vehicle?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(completeModal.startDate)} – {formatDate(completeModal.endDate)}
                </p>
                <p className="text-sm font-bold text-emerald-600 mt-1">{formatRupiah(completeModal.totalPrice)}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCompleteModal(null)}
                disabled={!!completingId}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleComplete}
                disabled={!!completingId}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {completingId
                  ? <><Loader2 size={14} className="animate-spin" /> Menyelesaikan...</>
                  : <><CheckCircle size={14} /> Ya, Selesaikan</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}