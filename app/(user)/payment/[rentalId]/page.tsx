'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Loader2, CreditCard, Banknote, QrCode,
  CheckCircle, AlertCircle, Calendar, Car, Clock,
  FileText, Upload, Image as ImageIcon, RefreshCw
} from 'lucide-react'
import { rentalApi, paymentApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Rental, Payment, PaymentMethod, PaymentInfo } from '@/types'

const METHOD_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'TRANSFER', label: 'Transfer Bank', icon: <Banknote size={20} />, desc: 'BCA, Mandiri, BNI, BRI' },
  { value: 'QRIS', label: 'QRIS', icon: <QrCode size={20} />, desc: 'Scan QR dari app apapun' },
]

const statusStyle: Record<string, string> = {
  PENDING: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25',
  PAID: 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/25',
  FAILED: 'bg-red-400/10 text-red-400 border border-red-400/25',
}
const statusLabel: Record<string, string> = {
  PENDING: 'Menunggu Pembayaran',
  PAID: 'Lunas',
  FAILED: 'Gagal',
}
const proofStatusLabel: Record<string, string> = {
  PENDING_REVIEW: 'Bukti sedang direview admin',
  REJECTED: 'Bukti ditolak, upload ulang',
}
const proofStatusStyle: Record<string, string> = {
  PENDING_REVIEW: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/25',
  REJECTED: 'bg-red-400/10 text-red-400 border border-red-400/25',
}

export default function PaymentPage() {
  const { rentalId } = useParams<{ rentalId: string }>()

  const [rental, setRental] = useState<Rental | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('TRANSFER')
  const [loadingRental, setLoadingRental] = useState(true)
  const [loadingPayment, setLoadingPayment] = useState(true)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!rentalId) return
    rentalApi.getOne(rentalId)
      .then(setRental)
      .catch(() => toast.error('Rental tidak ditemukan'))
      .finally(() => setLoadingRental(false))
  }, [rentalId])

  useEffect(() => {
    if (!rentalId) return
    paymentApi.getByRental(rentalId)
      .then((p) => {
        setPayment(p)
        // Fetch payment info sesuai method yang sudah dibuat
        fetchPaymentInfo(p.method)
      })
      .catch(() => { })
      .finally(() => setLoadingPayment(false))
  }, [rentalId])

  const fetchPaymentInfo = async (m: string) => {
    setLoadingInfo(true)
    try {
      const info = await paymentApi.getPaymentInfo(m)
      setPaymentInfo(info)
    } catch {
      // silent
    } finally {
      setLoadingInfo(false)
    }
  }

  const handleCreatePayment = async () => {
    setCreating(true)
    try {
      const newPayment = await paymentApi.create({ rentalId, method })
      setPayment(newPayment)
      // Ambil payment info setelah buat payment
      await fetchPaymentInfo(method)
      toast.success('Pembayaran berhasil dibuat!')
    } catch (err) {
      const msg = getErrorMessage(err)
      if (msg.includes('409') || msg.toLowerCase().includes('sudah')) {
        toast.error('Pembayaran untuk rental ini sudah dibuat')
      } else {
        toast.error(msg)
      }
    } finally {
      setCreating(false)
    }
  }

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !payment) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format harus JPG/PNG/WEBP'); return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran maksimal 5MB'); return
    }

    // Preview lokal
    const reader = new FileReader()
    reader.onload = () => setProofPreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const res = await paymentApi.uploadProof(payment.id, file)
      setPayment((prev) => prev ? { ...prev, proofUrl: res.proofUrl, proofStatus: res.proofStatus as any } : prev)
      toast.success('Bukti pembayaran berhasil diupload! Menunggu konfirmasi admin.')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setProofPreview(null)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const isLoading = loadingRental || loadingPayment

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#4ade80]" size={32} />
          <p className="text-sm text-white/40">Memuat data pembayaran...</p>
        </div>
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-white">Rental tidak ditemukan</p>
          <Link href="/my-rentals" className="mt-4 inline-flex items-center gap-2 bg-[#4ade80] text-[#080f1a] font-bold px-5 py-2.5 rounded-xl text-sm">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </div>
    )
  }

  const currentProof = proofPreview || payment?.proofUrl

  return (
    <div className="min-h-screen bg-[#080f1a]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <Link href="/my-rentals" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#4ade80] mb-6 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Sewa Saya
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Pembayaran</h1>

        {/* Info Rental */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Detail Sewa</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
              <img
                src={rental.vehicle?.imageUrl || `https://placehold.co/100x100/0f1f2e/4ade80?text=${encodeURIComponent(rental.vehicle?.name ?? 'K')}`}
                alt={rental.vehicle?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-white">{rental.vehicle?.name ?? '—'}</p>
              <p className="text-xs text-white/35">{rental.vehicle?.brand} · {rental.vehicle?.plateNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/40">
              <Calendar size={14} className="text-[#4ade80]" />
              <span>{formatDate(rental.startDate)} – {formatDate(rental.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Car size={14} className="text-[#4ade80]" />
              <span>{rental.vehicle?.type === 'CAR' ? 'Mobil' : 'Motor'}</span>
            </div>
          </div>
          <div className="border-t border-white/[0.06] mt-4 pt-4 flex justify-between items-center">
            <span className="text-sm text-white/40">Total Pembayaran</span>
            <span className="text-xl font-extrabold text-[#4ade80]">{formatRupiah(rental.totalPrice)}</span>
          </div>
        </div>

        {/* ── Sudah ada payment ── */}
        {payment ? (
          <div className="space-y-4">

            {/* Status */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Status Pembayaran</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {payment.status === 'PAID'
                    ? <CheckCircle size={32} className="text-[#4ade80]" />
                    : <Clock size={32} className="text-yellow-400" />
                  }
                  <div>
                    <p className="font-semibold text-white">{statusLabel[payment.status]}</p>
                    <p className="text-xs text-white/35">Metode: {payment.method}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[payment.status]}`}>
                  {statusLabel[payment.status]}
                </span>
              </div>

              {payment.reference && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-white/40 mb-1">Kode Referensi</p>
                  <p className="font-mono text-sm font-semibold text-white">{payment.reference}</p>
                </div>
              )}

              {/* Status bukti */}
              {payment.proofStatus && payment.status !== 'PAID' && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${proofStatusStyle[payment.proofStatus]}`}>
                  {payment.proofStatus === 'PENDING_REVIEW'
                    ? <Clock size={15} />
                    : <AlertCircle size={15} />
                  }
                  {proofStatusLabel[payment.proofStatus]}
                </div>
              )}
            </div>

            {/* Info Cara Bayar */}
            {payment.status !== 'PAID' && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Cara Pembayaran</h2>

                {loadingInfo ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-[#4ade80]" />
                  </div>
                ) : paymentInfo ? (
                  <>
                    <p className="text-sm text-white/60">{paymentInfo.instructions}</p>

                    {/* TRANSFER — tampil rekening */}
                    {paymentInfo.method === 'TRANSFER' && paymentInfo.accounts && (
                      <div className="space-y-2">
                        {paymentInfo.accounts.map((acc, i) => {
                          return (
                            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                              <p className="text-xs text-white/40 mb-1">{acc.bank}</p>
                              <p className="font-mono text-lg font-bold text-white">{acc.accountNumber}</p>
                              <p className="text-xs text-white/50 mt-0.5">a.n. {acc.accountName}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* QRIS — tampil QR */}
                    {paymentInfo.method === 'QRIS' && paymentInfo.qrisImageUrl && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-white p-4 rounded-2xl">
                          <img src={paymentInfo.qrisImageUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-white">{paymentInfo.qrisName}</p>
                          <p className="text-xs text-white/40">NMID: {paymentInfo.qrisNmid}</p>
                        </div>
                      </div>
                    )}

                    {paymentInfo.note && (
                      <p className="text-xs text-white/30 italic">{paymentInfo.note}</p>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* Upload/Detail Bukti — hanya jika belum PAID */}
            {payment.status !== 'PAID' && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">
                  {payment.proofStatus === 'PENDING_REVIEW' ? 'Bukti Pembayaran' : 'Upload Bukti Pembayaran'}
                </h2>
                {payment.proofStatus !== 'PENDING_REVIEW' && (
                  <p className="text-xs text-white/40">Setelah transfer/scan, upload foto bukti pembayaran kamu.</p>
                )}

                {/* Preview bukti */}
                {currentProof && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={currentProof} alt="Bukti" className="w-full max-h-48 object-cover" />
                  </div>
                )}

                {payment.proofStatus !== 'PENDING_REVIEW' ? (
                  <label className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-2xl py-6 cursor-pointer transition-all ${uploading ? 'border-white/10 opacity-50 pointer-events-none' : 'border-white/15 hover:border-[#4ade80]/50 hover:bg-[#4ade80]/5'
                    }`}>
                    {uploading ? (
                      <><Loader2 size={22} className="animate-spin text-[#4ade80]" /><span className="text-sm text-white/40">Mengupload...</span></>
                    ) : (
                      <>
                        <Upload size={22} className="text-white/30" />
                        <span className="text-sm font-medium text-white/60">{currentProof ? 'Ganti bukti pembayaran' : 'Klik untuk upload bukti'}</span>
                        <span className="text-xs text-white/25">JPG · PNG · WEBP — maks. 5MB</span>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadProof} disabled={uploading} />
                  </label>
                ) : (
                  /* Sudah ada bukti tapi belum direview */
                  <div className="flex items-center gap-2 text-xs text-yellow-400/70">
                    <Clock size={13} /> Bukti sudah diupload, menunggu konfirmasi admin
                  </div>
                )}
              </div>
            )}

            {/* PAID */}
            {payment.status === 'PAID' && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center space-y-3">
                <CheckCircle size={40} className="text-[#4ade80] mx-auto" />
                <p className="font-semibold text-white">Pembayaran Lunas!</p>
                <p className="text-sm text-white/40">Terima kasih, pesanan kamu sudah dikonfirmasi.</p>
                <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                  <Link href="/my-rentals" className="inline-flex items-center gap-2 bg-[#4ade80] text-[#080f1a] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#22c55e] transition-colors">
                    Lihat Sewa Saya
                  </Link>
                  <Link href={`/invoice/${rentalId}`} className="inline-flex items-center gap-2 border border-white/20 text-white/70 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/10 hover:text-white transition-colors">
                    <FileText size={15} /> Lihat Invoice
                  </Link>
                </div>
              </div>
            )}
          </div>

        ) : (
          /* ── Belum ada payment — pilih metode ── */
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Pilih Metode Pembayaran</h2>
            <div className="space-y-3">
              {METHOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMethod(opt.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${method === opt.value
                      ? 'border-[#4ade80]/40 bg-[#4ade80]/5'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method === opt.value ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'bg-white/5 text-white/40'
                    }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${method === opt.value ? 'text-white' : 'text-white/60'}`}>{opt.label}</p>
                    <p className="text-xs text-white/30">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${method === opt.value ? 'border-[#4ade80] bg-[#4ade80]' : 'border-white/20'
                    }`} />
                </button>
              ))}
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-white/40">Total yang dibayar</span>
                <span className="font-bold text-[#4ade80]">{formatRupiah(rental.totalPrice)}</span>
              </div>
              <button
                onClick={handleCreatePayment}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed text-[#080f1a] font-bold py-3 px-4 rounded-xl transition-colors"
              >
                {creating
                  ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                  : <><CreditCard size={16} /> Lanjut Bayar</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}