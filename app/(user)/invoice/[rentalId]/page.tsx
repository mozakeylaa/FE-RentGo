'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Loader2, AlertCircle,
  Calendar, Car, CheckCircle, Printer, Download
} from 'lucide-react'
import { invoiceApi } from '@/lib/api'
import axiosInstance, { getErrorMessage } from '@/lib/axios'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Invoice } from '@/types'

export default function InvoicePage() {
  const { rentalId } = useParams<{ rentalId: string }>()
  const [invoice, setInvoice]       = useState<Invoice | null>(null)
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!rentalId) return
    invoiceApi.getByRental(rentalId)
      .then(setInvoice)
      .catch((err) => {
        const msg = getErrorMessage(err)
        if (msg.includes('404') || msg.toLowerCase().includes('belum')) {
          setNotFound(true)
        } else {
          toast.error(msg)
        }
      })
      .finally(() => setLoading(false))
  }, [rentalId])

  const handleDownload = async () => {
    if (!invoice || downloading) return
    setDownloading(true)

    try {
      const res = await axiosInstance.get(
        `/invoices/rental/${rentalId}/download`,
        { responseType: 'blob' }
      )

      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${invoice.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Invoice berhasil didownload!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#4ade80]" size={32} />
          <p className="text-sm text-white/40">Memuat invoice...</p>
        </div>
      </div>
    )
  }

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={40} className="text-yellow-400 mx-auto mb-3" />
          <p className="font-semibold text-white mb-1">Invoice belum tersedia</p>
          <p className="text-sm text-white/40 mb-4">Invoice akan muncul setelah pembayaran dikonfirmasi</p>
          <Link href="/my-rentals" className="inline-flex items-center gap-2 bg-[#4ade80] text-[#080f1a] font-bold px-5 py-2.5 rounded-xl text-sm">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080f1a]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-center justify-between mb-6">
          <Link href="/my-rentals" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#4ade80] transition-colors">
            <ArrowLeft size={16} /> Kembali
          </Link>

          {/* Tombol Cetak + Download */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
            >
              <Printer size={15} /> Cetak
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/25 hover:bg-[#4ade80]/20 text-[#4ade80] text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading
                ? <><Loader2 size={15} className="animate-spin" /> Mengunduh...</>
                : <><Download size={15} /> Download PDF</>
              }
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden print:bg-white print:text-black">

          {/* Header Invoice */}
          <div className="bg-[#4ade80]/10 border-b border-[#4ade80]/20 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4ade80]/20 border border-[#4ade80]/30 rounded-xl flex items-center justify-center">
                  <Car size={20} className="text-[#4ade80]" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">RentGo</p>
                  <p className="text-xs text-white/40">Platform Sewa Kendaraan</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <CheckCircle size={14} className="text-[#4ade80]" />
                  <span className="text-xs font-semibold text-[#4ade80]">LUNAS</span>
                </div>
                <p className="text-xs text-white/40">Invoice</p>
              </div>
            </div>
          </div>

          {/* Body Invoice */}
          <div className="px-6 py-5 space-y-5">

            {/* Nomor & Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Nomor Invoice</p>
                <p className="font-mono font-semibold text-white">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Tanggal Terbit</p>
                <p className="font-semibold text-white">{formatDate(invoice.issuedAt)}</p>
              </div>
            </div>

            {/* Detail Sewa */}
            {invoice.rental && (
              <>
                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Detail Sewa</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                        <img
                          src={invoice.rental.vehicle?.imageUrl || `https://placehold.co/100x100/0f1f2e/4ade80?text=${encodeURIComponent(invoice.rental.vehicle?.name ?? 'K')}`}
                          alt={invoice.rental.vehicle?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{invoice.rental.vehicle?.name ?? '—'}</p>
                        <p className="text-xs text-white/35">{invoice.rental.vehicle?.brand} · {invoice.rental.vehicle?.plateNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/40">
                      <Calendar size={14} className="text-[#4ade80]" />
                      <span>{formatDate(invoice.rental.startDate)} – {formatDate(invoice.rental.endDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Rincian Harga */}
                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Rincian Pembayaran</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Total Sewa</span>
                      <span className="text-white font-medium">{formatRupiah(invoice.rental.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Status</span>
                      <span className="text-[#4ade80] font-semibold">Lunas</span>
                    </div>
                    <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                      <span className="font-semibold text-white">Total Dibayar</span>
                      <span className="font-extrabold text-[#4ade80] text-lg">{formatRupiah(invoice.amount)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="border-t border-white/[0.06] pt-4 text-center">
              <p className="text-xs text-white/25">Terima kasih telah menggunakan RentGo</p>
              <p className="text-xs text-white/20 mt-0.5">© 2026 RentGo. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}