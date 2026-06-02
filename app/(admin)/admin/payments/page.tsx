'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Eye, X, Loader2, Search, Clock
} from 'lucide-react'
import { paymentApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Payment, PaymentStatus, PaginationMeta } from '@/types'
import Loader from '@/components/Loader'
import EmptyState from '@/components/EmptyState'

const STATUS_OPTIONS: { value: PaymentStatus | ''; label: string }[] = [
  { value: '',        label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'PAID',    label: 'Lunas' },
  { value: 'FAILED',  label: 'Gagal / Timeout' },
]

const statusBadge: Record<string, string> = {
  PENDING: 'badge-yellow',
  PAID:    'badge-green',
  FAILED:  'badge-red',
}
const statusLabel: Record<string, string> = {
  PENDING: 'Menunggu',
  PAID:    'Lunas',
  FAILED:  'Gagal',
}
const proofStatusLabel: Record<string, string> = {
  PENDING_REVIEW: 'Review Bukti',
  REJECTED:       'Ditolak',
}
const proofStatusBadge: Record<string, string> = {
  PENDING_REVIEW: 'badge-yellow',
  REJECTED:       'badge-red',
}

const LIMIT = 10

// Cek apakah payment PENDING sudah expired (> 5 menit)
function isExpired(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() > 5 * 60 * 1000
}

export default function AdminPaymentsPage() {
  const [payments, setPayments]         = useState<Payment[]>([])
  const [meta, setMeta]                 = useState<PaginationMeta | null>(null)
  const [loading, setLoading]           = useState(true)
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('')
  const [page, setPage]                 = useState(1)
  const [search, setSearch]             = useState('')

  // Modal bukti
  const [proofModal, setProofModal] = useState<Payment | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [rejecting, setRejecting]   = useState(false)

  const fetchPayments = async (p = page) => {
    setLoading(true)
    try {
      const res = await paymentApi.getAllPaginated({
        ...(filterStatus ? { status: filterStatus } : {}),
        page: p,
        limit: LIMIT,
      })
      setPayments(res.items)
      setMeta(res.meta)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1); fetchPayments(1) }, [filterStatus])
  useEffect(() => { fetchPayments(page) }, [page])

  const handleConfirm = async () => {
    if (!proofModal) return
    setConfirming(true)
    try {
      await paymentApi.confirmPayment(proofModal.id)
      toast.success('Pembayaran dikonfirmasi!')
      setProofModal(null)
      fetchPayments(page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setConfirming(false)
    }
  }

  const handleReject = async () => {
    if (!proofModal) return
    setRejecting(true)
    try {
      await paymentApi.rejectPayment(proofModal.id)
      toast.success('Bukti pembayaran ditolak, user perlu upload ulang.')
      setProofModal(null)
      fetchPayments(page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRejecting(false)
    }
  }

  // Filter client-side by search
  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.rental?.user?.name?.toLowerCase().includes(q) ||
      p.rental?.user?.email?.toLowerCase().includes(q) ||
      p.rental?.vehicle?.name?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Pembayaran</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {meta ? `${meta.total} pembayaran ditemukan` : `${payments.length} pembayaran ditemukan`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
            className="input-field w-auto py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => fetchPayments(page)} className="btn-secondary py-2 px-3">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Search */}
      {!loading && payments.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama penyewa, kendaraan, atau referensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-slate-800 placeholder:text-slate-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {search && (
        <p className="text-sm text-slate-500 mb-4">
          Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> hasil untuk "<span className="text-primary-600">{search}</span>"
        </p>
      )}

      {loading ? (
        <Loader />
      ) : payments.length === 0 ? (
        <EmptyState title="Tidak ada pembayaran" description="Belum ada pembayaran dengan status ini." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Pembayaran tidak ditemukan" description={`Tidak ada hasil untuk "${search}".`} />
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden lg:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Penyewa', 'Kendaraan', 'Metode', 'Jumlah', 'Referensi', 'Tanggal', 'Bukti', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => {
                  const expired = p.status === 'PENDING' && isExpired(p.createdAt)
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${expired ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">{p.rental?.user?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{p.rental?.user?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">{p.rental?.vehicle?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{p.rental?.vehicle?.plateNumber ?? ''}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{p.method}</td>
                      <td className="px-4 py-4 font-semibold text-primary-600">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">
                        {p.reference ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        {p.proofStatus ? (
                          <span className={proofStatusBadge[p.proofStatus] ?? 'badge-gray'}>
                            {proofStatusLabel[p.proofStatus] ?? p.proofStatus}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                            <Clock size={11} /> Timeout
                          </span>
                        ) : (
                          <span className={statusBadge[p.status] ?? 'badge-gray'}>
                            {statusLabel[p.status] ?? p.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {p.proofUrl && p.status !== 'PAID' && !expired && (
                          <button
                            onClick={() => setProofModal(p)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye size={13} /> Lihat Bukti
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Kartu Mobile */}
          <div className="lg:hidden space-y-3">
            {filtered.map((p) => {
              const expired = p.status === 'PENDING' && isExpired(p.createdAt)
              return (
                <div key={p.id} className={`card space-y-3 ${expired ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{p.rental?.user?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{p.rental?.user?.email}</p>
                    </div>
                    {expired ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                        <Clock size={11} /> Timeout
                      </span>
                    ) : (
                      <span className={statusBadge[p.status] ?? 'badge-gray'}>{statusLabel[p.status]}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                    <p><span className="text-slate-400">Kendaraan:</span> {p.rental?.vehicle?.name ?? '—'}</p>
                    <p><span className="text-slate-400">Metode:</span> {p.method}</p>
                    <p><span className="text-slate-400">Jumlah:</span>{' '}
                      <span className="font-semibold text-primary-600">{formatRupiah(p.amount)}</span>
                    </p>
                    {p.reference && (
                      <p><span className="text-slate-400">Referensi:</span>{' '}
                        <span className="font-mono text-xs">{p.reference}</span>
                      </p>
                    )}
                    <p><span className="text-slate-400">Tanggal:</span> {formatDate(p.createdAt)}</p>
                    {p.proofStatus && (
                      <p><span className="text-slate-400">Bukti:</span>{' '}
                        <span className={proofStatusBadge[p.proofStatus]}>{proofStatusLabel[p.proofStatus]}</span>
                      </p>
                    )}
                  </div>
                  {p.proofUrl && p.status !== 'PAID' && !expired && (
                    <button
                      onClick={() => setProofModal(p)}
                      className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded-xl transition-colors"
                    >
                      <Eye size={15} /> Lihat Bukti Pembayaran
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

      {/* Modal Lihat Bukti */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProofModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Bukti Pembayaran</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {proofModal.rental?.user?.name} · {proofModal.method} · {formatRupiah(proofModal.amount)}
                </p>
              </div>
              <button onClick={() => setProofModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 mb-5">
              <img src={proofModal.proofUrl!} alt="Bukti pembayaran" className="w-full max-h-72 object-contain bg-slate-50" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={rejecting || confirming}
                className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {rejecting
                  ? <><Loader2 size={15} className="animate-spin" /> Menolak...</>
                  : <><XCircle size={15} /> Tolak</>
                }
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirming || rejecting}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {confirming
                  ? <><Loader2 size={15} className="animate-spin" /> Mengkonfirmasi...</>
                  : <><CheckCircle size={15} /> Konfirmasi</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}