'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, Trash2, Loader2, Users, Shield, User as UserIcon, Search, X } from 'lucide-react'
import { userApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import type { User } from '@/types'
import Loader from '@/components/Loader'
import EmptyState from '@/components/EmptyState'

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<User[]>([])
  const [loading, setLoading]       = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch]         = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await userApi.getAll()
      setUsers(Array.isArray(data) ? data : (data as any)?.items ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pengguna "${name}"?`)) return
    setDeletingId(id)
    try {
      await userApi.remove(id)
      toast.success('Pengguna berhasil dihapus!')
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  const admins  = users.filter((u) => u.role === 'ADMIN')
  const members = users.filter((u) => u.role === 'USER')

  // Filter by search
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Pengguna</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary py-2 px-3">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{users.length}</p>
              <p className="text-xs text-slate-400">Total Pengguna</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{admins.length}</p>
              <p className="text-xs text-slate-400">Admin</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserIcon size={18} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{members.length}</p>
              <p className="text-xs text-slate-400">Member</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {!loading && users.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email pengguna..."
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
      ) : users.length === 0 ? (
        <EmptyState title="Belum ada pengguna" description="Belum ada pengguna yang terdaftar." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Pengguna tidak ditemukan" description={`Tidak ada pengguna dengan nama atau email "${search}".`} />
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden lg:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Pengguna', 'Email', 'Telepon', 'Role', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            u.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-primary-50 text-primary-600'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="font-medium text-slate-800">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{u.email}</td>
                    <td className="px-5 py-4 text-slate-500">{u.phone ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deletingId === u.id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === u.id
                            ? <><Loader2 size={12} className="animate-spin" /> Menghapus...</>
                            : <><Trash2 size={12} /> Hapus</>
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu Mobile */}
          <div className="lg:hidden space-y-3">
            {filtered.map((u) => (
              <div key={u.id} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-primary-50 text-primary-600'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {u.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
                {u.phone && (
                  <p className="text-sm text-slate-500 border-t border-slate-100 pt-2">📞 {u.phone}</p>
                )}
                {u.role !== 'ADMIN' && (
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deletingId === u.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deletingId === u.id
                        ? <><Loader2 size={12} className="animate-spin" /> Menghapus...</>
                        : <><Trash2 size={12} /> Hapus Pengguna</>
                      }
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}