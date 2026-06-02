'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, Loader2, FileText, Search, X } from 'lucide-react'
import { invoiceApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Invoice } from '@/types'
import Loader from '@/components/Loader'
import EmptyState from '@/components/EmptyState'

export default function AdminInvoicesPage() {
  const [invoices, setInvoices]         = useState<Invoice[]>([])
  const [loading, setLoading]           = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [search, setSearch]             = useState('')

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const data = await invoiceApi.getAll()
      setInvoices(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  const handleGenerate = async (rentalId: string) => {
    setGeneratingId(rentalId)
    try {
      await invoiceApi.generate(rentalId)
      toast.success('Invoice berhasil digenerate!')
      fetchInvoices()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setGeneratingId(null)
    }
  }

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.rental?.user?.name?.toLowerCase().includes(q) ||
      inv.rental?.user?.email?.toLowerCase().includes(q) ||
      inv.rental?.vehicle?.name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Invoice</h1>
          <p className="text-slate-500 text-sm mt-0.5">{invoices.length} invoice ditemukan</p>
        </div>
        <button onClick={fetchInvoices} className="btn-secondary py-2 px-3">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Search Bar */}
      {!loading && invoices.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no. invoice, nama penyewa, atau kendaraan..."
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

      {/* Result info */}
      {search && (
        <p className="text-sm text-slate-500 mb-4">
          Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> hasil untuk "<span className="text-primary-600">{search}</span>"
        </p>
      )}

      {loading ? (
        <Loader />
      ) : invoices.length === 0 ? (
        <EmptyState title="Tidak ada invoice" description="Belum ada invoice yang digenerate." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Invoice tidak ditemukan" description={`Tidak ada invoice dengan kata kunci "${search}".`} />
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden lg:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['No. Invoice', 'Penyewa', 'Kendaraan', 'Jumlah', 'Tanggal Terbit', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{inv.rental?.user?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{inv.rental?.user?.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">{inv.rental?.vehicle?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{inv.rental?.vehicle?.plateNumber ?? ''}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary-600">
                      {formatRupiah(inv.amount)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(inv.issuedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleGenerate(inv.rentalId)}
                        disabled={generatingId === inv.rentalId}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
                      >
                        {generatingId === inv.rentalId
                          ? <><Loader2 size={12} className="animate-spin" /> Generate...</>
                          : <><FileText size={12} /> Generate Ulang</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu Mobile */}
          <div className="lg:hidden space-y-3">
            {filtered.map((inv) => (
              <div key={inv.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-semibold text-slate-800">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(inv.issuedAt)}</p>
                  </div>
                  <span className="badge-green">Lunas</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  <p><span className="text-slate-400">Penyewa:</span> {inv.rental?.user?.name ?? '—'}</p>
                  <p><span className="text-slate-400">Kendaraan:</span> {inv.rental?.vehicle?.name ?? '—'}</p>
                  <p><span className="text-slate-400">Jumlah:</span>{' '}
                    <span className="font-semibold text-primary-600">{formatRupiah(inv.amount)}</span>
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleGenerate(inv.rentalId)}
                    disabled={generatingId === inv.rentalId}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    {generatingId === inv.rentalId
                      ? <><Loader2 size={12} className="animate-spin" /> Generate...</>
                      : <><FileText size={12} /> Generate Ulang</>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}