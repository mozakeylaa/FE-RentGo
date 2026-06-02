'use client'
import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  Car, CheckCircle, ClipboardList, Clock,
  TrendingUp, Mail, Phone, Save,
  X, Pencil, LayoutDashboard, AlertCircle, BarChart2, Camera,
} from 'lucide-react'
import { rentalApi, dashboardApi } from '@/lib/api'
import axiosInstance, { getErrorMessage } from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import type { Rental } from '@/types'
import Loader from '@/components/Loader'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface Stats {
  totalVehicles:     number
  availableVehicles: number
  totalRentals:      number
  pendingRentals:    number
}

interface MonthlyData {
  month: string
  total: number
  selesai: number
  pending: number
  dibatalkan: number
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function buildMonthlyData(rentals: Rental[], monthCount: number): MonthlyData[] {
  const now = new Date()
  const result: MonthlyData[] = []
  for (let i = monthCount - 1; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year  = d.getFullYear()
    const month = d.getMonth()
    const label = `${MONTHS[month]} ${year}`
    const filtered = rentals.filter((r) => {
      const rd = new Date(r.startDate)
      return rd.getFullYear() === year && rd.getMonth() === month
    })
    result.push({
      month:      label,
      total:      filtered.length,
      selesai:    filtered.filter((r) => r.status === 'COMPLETED').length,
      pending:    filtered.filter((r) => r.status === 'PENDING').length,
      dibatalkan: filtered.filter((r) => r.status === 'CANCELLED').length,
    })
  }
  return result
}

export default function AdminDashboardPage() {
  const { user, setUser } = useAuth()
  const [stats, setStats]                 = useState<Stats | null>(null)
  const [loading, setLoading]             = useState(true)
  const [editOpen, setEditOpen]           = useState(false)
  const [saveLoading, setSaveLoading]     = useState(false)
  const [recentRentals, setRecentRentals] = useState<Rental[]>([])
  const [allRentals, setAllRentals]       = useState<Rental[]>([])
  const [monthFilter, setMonthFilter]     = useState<1 | 2 | 3>(3)
  const [form, setForm]                   = useState({ name: '', email: '', phone: '' })

  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phone: user.phone ?? '' })
  }, [user])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashStats, rentals] = await Promise.all([
          dashboardApi.getStats(),
          rentalApi.getAll(),
        ])
        const r = Array.isArray(rentals) ? rentals : []
        setStats({
          totalVehicles:     dashStats.totalVehicles,
          availableVehicles: dashStats.availableVehicles,
          totalRentals:      dashStats.totalRentals,
          pendingRentals:    dashStats.pendingRentals,
        })
        setRecentRentals(r.slice(0, 5))
        setAllRentals(r)
      } catch (err) {
        console.error('fetchStats error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Hanya file JPG/PNG yang diperbolehkan')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }
    setSaveLoading(true)
    try {
      await axiosInstance.patch('/auth/profile', {
        name:  form.name,
        phone: form.phone,
      })
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        await axiosInstance.post('/auth/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      const res = await axiosInstance.get('/auth/me')
      const updatedUser = res.data.data
      if (setUser) setUser(updatedUser)
      toast.success('Profil berhasil diperbarui!')
      handleClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaveLoading(false)
    }
  }

  const handleClose = () => {
    setEditOpen(false)
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const chartData = buildMonthlyData(allRentals, monthFilter)

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

  const cards = stats ? [
    { label: 'Total Kendaraan',     value: stats.totalVehicles,     icon: <Car size={20} />,           color: 'bg-blue-50 text-blue-600',       border: 'border-blue-100' },
    { label: 'Tersedia',            value: stats.availableVehicles, icon: <CheckCircle size={20} />,   color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Total Pesanan',       value: stats.totalRentals,      icon: <ClipboardList size={20} />, color: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
    { label: 'Menunggu Konfirmasi', value: stats.pendingRentals,    icon: <Clock size={20} />,         color: 'bg-amber-50 text-amber-600',     border: 'border-amber-100' },
  ] : []

  const displayAvatar = avatarPreview ?? (user as any)?.avatarUrl ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-sm font-medium mb-1">
            <LayoutDashboard size={15} />
            <span>Admin Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat datang, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan data RentGo hari ini</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-200 flex-shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-amber-100">
                <span className="text-2xl font-bold text-amber-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-slate-900">{user?.name}</p>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Administrator
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Mail size={11} />{user?.email}</span>
              {user?.phone && (
                <span className="flex items-center gap-1"><Phone size={11} />{user.phone}</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-700 hover:text-primary-700 text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Pencil size={14} /> Edit Profil
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <div key={c.label} className={`card flex items-center gap-4 border ${c.border}`}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Pesanan Terbaru */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={17} className="text-primary-600" />
                  Pesanan Terbaru
                </h2>
                <a href="/admin/rentals" className="text-xs text-primary-600 hover:underline font-medium">
                  Lihat semua →
                </a>
              </div>
              {recentRentals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <AlertCircle size={28} />
                  <p className="text-sm">Belum ada pesanan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3">Kendaraan</th>
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3">Mulai</th>
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3">Selesai</th>
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3">Status</th>
                        <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentRentals.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-medium text-slate-800 max-w-[140px] truncate">
                            {r.vehicle?.name ?? r.vehicleId.slice(0, 8) + '...'}
                          </td>
                          <td className="py-3 text-slate-500">
                            {new Date(r.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-3 text-slate-500">
                            {new Date(r.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-3">
                            <span className={`badge ${statusBadge[r.status] ?? 'badge-gray'}`}>
                              {statusLabel[r.status] ?? r.status}
                            </span>
                          </td>
                          <td className="py-3 text-right font-semibold text-slate-800">
                            Rp {r.totalPrice.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Akses Cepat + Stats */}
            <div className="flex flex-col gap-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={17} className="text-primary-600" />
                Akses Cepat
              </h2>
              <a href="/admin/vehicles" className="card-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <Car size={22} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Kelola Kendaraan</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tambah, edit, hapus kendaraan</p>
                </div>
              </a>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <BarChart2 size={16} className="text-primary-600" />
                    Statistik Pesanan
                  </h3>
                  <div className="flex items-center gap-1">
                    {([1, 2, 3] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMonthFilter(m)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                          monthFilter === m
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {m}bln
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Total',      value: chartData.reduce((a, b) => a + b.total, 0),      color: 'text-slate-800' },
                    { label: 'Selesai',    value: chartData.reduce((a, b) => a + b.selesai, 0),    color: 'text-emerald-600' },
                    { label: 'Dibatalkan', value: chartData.reduce((a, b) => a + b.dibatalkan, 0), color: 'text-red-500' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="total"      name="Total"      fill="#0d9488" radius={[4,4,0,0]} />
                    <Bar dataKey="selesai"    name="Selesai"    fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="dibatalkan" name="Dibatalkan" fill="#f87171" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal Edit Profil ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">Edit Profil</h3>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200">
                  {avatarPreview || (user as any)?.avatarUrl ? (
                    <img src={avatarPreview ?? (user as any)?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100">
                      <span className="text-2xl font-bold text-amber-600">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-1.5 shadow transition-colors"
                >
                  <Camera size={13} />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
              <p className="text-xs text-slate-400 mt-2">JPG/PNG, maks. 2MB</p>
              {avatarFile && <p className="text-xs text-teal-600 mt-1 font-medium">✓ {avatarFile.name}</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nama Lengkap</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="label">Email</label>
                <input value={form.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <label className="label">Nomor Telepon</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="08xxxxxxxxxx" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleClose} disabled={saveLoading} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleSave} disabled={saveLoading} className="btn-primary flex-1 disabled:opacity-60">
                <Save size={15} />
                {saveLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}