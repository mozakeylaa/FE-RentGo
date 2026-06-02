'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, RefreshCw, AlertTriangle, Loader2, Images, X, ImagePlus, Star, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import { vehicleApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/axios'
import { formatRupiah } from '@/lib/format'
import type { Vehicle, VehicleImage } from '@/types'
import Loader from '@/components/Loader'
import EmptyState from '@/components/EmptyState'
import VehicleForm, { type VehicleFormData } from '@/components/VehicleForm'
import axiosInstance from '@/lib/axios'

const statusBadge: Record<string, string> = {
  AVAILABLE:   'badge-green',
  RENTED:      'badge-yellow',
  MAINTENANCE: 'badge-gray',
}
const statusLabel: Record<string, string> = {
  AVAILABLE:   'Tersedia',
  RENTED:      'Disewa',
  MAINTENANCE: 'Perawatan',
}
const typeLabel: Record<string, string> = {
  CAR: 'Mobil', MOTORCYCLE: 'Motor', BICYCLE: 'Sepeda', BUS: 'Bus',
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles]         = useState<Vehicle[]>([])
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState<Vehicle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [togglingId, setTogglingId]     = useState<string | null>(null)
  const [search, setSearch]             = useState('')

  const [galleryTarget, setGalleryTarget]   = useState<Vehicle | null>(null)
  const [galleryImages, setGalleryImages]   = useState<VehicleImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [uploadingImg, setUploadingImg]     = useState(false)
  const [deletingImgId, setDeletingImgId]   = useState<string | null>(null)
  const [previewImg, setPreviewImg]         = useState<string | null>(null)

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const res = await vehicleApi.getAll({ limit: 100 })
      setVehicles(res.items)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicles() }, [])

  // Filter client-side
  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase()
    return (
      v.name.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.plateNumber.toLowerCase().includes(q) ||
      v.location?.toLowerCase().includes(q) ||
      typeLabel[v.type]?.toLowerCase().includes(q)
    )
  })

  // Toggle AVAILABLE ↔ MAINTENANCE
  const handleToggleStatus = async (v: Vehicle) => {
    if (v.status === 'RENTED') {
      toast.error('Kendaraan sedang disewa, tidak bisa diubah statusnya')
      return
    }
    const newStatus = v.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE'
    setTogglingId(v.id)
    try {
      await vehicleApi.update(v.id, { status: newStatus })
      setVehicles((prev) => prev.map((item) =>
        item.id === v.id ? { ...item, status: newStatus } : item
      ))
      toast.success(`${v.name} → ${newStatus === 'AVAILABLE' ? 'Tersedia' : 'Tidak Tersedia'}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setTogglingId(null)
    }
  }

  const handleSubmit = async (data: VehicleFormData, imageFile?: File) => {
    setSubmitting(true)
    try {
      let vehicle: Vehicle
      if (editTarget) {
        vehicle = await vehicleApi.update(editTarget.id, data)
        toast.success('Kendaraan berhasil diperbarui!')
      } else {
        vehicle = await vehicleApi.create(data)
        toast.success('Kendaraan berhasil ditambahkan!')
      }
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        await axiosInstance.post(`/vehicles/${vehicle.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Foto utama berhasil diupload!')
      }
      setShowForm(false)
      setEditTarget(null)
      fetchVehicles()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await vehicleApi.remove(deleteTarget.id)
      toast.success('Kendaraan berhasil dihapus!')
      setDeleteTarget(null)
      fetchVehicles()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const openGallery = async (v: Vehicle) => {
    setGalleryTarget(v)
    setGalleryLoading(true)
    try {
      const imgs = await vehicleApi.getImages(v.id)
      setGalleryImages(Array.isArray(imgs) ? imgs : [])
    } catch {
      setGalleryImages([])
    } finally {
      setGalleryLoading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !galleryTarget) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Hanya JPG/PNG/WEBP'); return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB'); return
    }
    setUploadingImg(true)
    try {
      const newImg = await vehicleApi.uploadGalleryImage(galleryTarget.id, file)
      setGalleryImages((prev) => [...prev, newImg])
      toast.success('Foto berhasil diupload!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploadingImg(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!galleryTarget) return
    setDeletingImgId(imageId)
    try {
      await vehicleApi.deleteImage(galleryTarget.id, imageId)
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Foto berhasil dihapus!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeletingImgId(null)
    }
  }

  const openEdit  = (v: Vehicle) => { setEditTarget(v); setShowForm(true) }
  const openAdd   = () => { setEditTarget(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditTarget(null) }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Kendaraan</h1>
          <p className="text-slate-500 text-sm mt-0.5">{vehicles.length} kendaraan terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchVehicles} className="btn-secondary py-2 px-3"><RefreshCw size={15} /></button>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Tambah Kendaraan</button>
        </div>
      </div>

      {/* Search Bar */}
      {!loading && vehicles.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, merek, plat, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-slate-800 placeholder:text-slate-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
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

      {loading ? <Loader /> : vehicles.length === 0 ? (
        <EmptyState title="Belum ada kendaraan" description="Tambahkan kendaraan pertama." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Kendaraan tidak ditemukan" description={`Tidak ada kendaraan dengan kata kunci "${search}".`} />
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden md:block card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kendaraan</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipe</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plat</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Harga/Hari</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tersedia</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={v.imageUrl || `https://placehold.co/80x80/e2e8f0/94a3b8?text=${encodeURIComponent(v.name)}`} alt={v.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{v.name}</p>
                          <p className="text-xs text-slate-400">{v.brand} · {v.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{typeLabel[v.type] ?? v.type}</td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">{v.plateNumber}</td>
                    <td className="px-5 py-4 font-semibold text-primary-600">{formatRupiah(v.pricePerDay)}</td>
                    <td className="px-5 py-4">
                      <span className={statusBadge[v.status] ?? 'badge-gray'}>{statusLabel[v.status] ?? v.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {v.status !== 'RENTED' ? (
                        <button
                          onClick={() => handleToggleStatus(v)}
                          disabled={togglingId === v.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                            v.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {togglingId === v.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : v.status === 'AVAILABLE'
                            ? <><ToggleRight size={15} /> Aktif</>
                            : <><ToggleLeft size={15} /> Nonaktif</>
                          }
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Sedang disewa</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openGallery(v)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Kelola Foto"><Images size={15} /></button>
                        <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(v)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu Mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((v) => (
              <div key={v.id} className="card flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={v.imageUrl || `https://placehold.co/80x80/e2e8f0/94a3b8?text=${encodeURIComponent(v.name)}`} alt={v.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{v.name}</p>
                  <p className="text-xs text-slate-400">{v.plateNumber} · {v.year}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={statusBadge[v.status] ?? 'badge-gray'}>{statusLabel[v.status]}</span>
                    <span className="text-xs font-semibold text-primary-600">{formatRupiah(v.pricePerDay)}</span>
                  </div>
                  {v.status !== 'RENTED' && (
                    <button
                      onClick={() => handleToggleStatus(v)}
                      disabled={togglingId === v.id}
                      className={`mt-2 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 ${
                        v.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {togglingId === v.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : v.status === 'AVAILABLE'
                        ? <><ToggleRight size={13} /> Aktif — klik nonaktifkan</>
                        : <><ToggleLeft size={13} /> Nonaktif — klik aktifkan</>
                      }
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openGallery(v)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"><Images size={15} /></button>
                  <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteTarget(v)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && <VehicleForm initial={editTarget ?? undefined} onSubmit={handleSubmit} onClose={closeForm} submitting={submitting} />}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Hapus Kendaraan?</p>
                <p className="text-sm text-slate-500 mt-0.5"><span className="font-medium">{deleteTarget.name}</span> akan dihapus permanen.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
                {deleting ? <><Loader2 size={15} className="animate-spin" /> Menghapus...</> : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Galeri */}
      {galleryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setGalleryTarget(null); setPreviewImg(null) }} />
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl z-10" style={{ background: 'linear-gradient(135deg, #0f1f2e 0%, #0a1628 100%)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Images size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Galeri Foto</h3>
                  <p className="text-xs text-white/40 mt-0.5">{galleryTarget.name} · {galleryImages.length} foto</p>
                </div>
              </div>
              <button onClick={() => { setGalleryTarget(null); setPreviewImg(null) }} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            {previewImg && (
              <div className="relative px-6 pt-5">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-white/5">
                  <img src={previewImg} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={() => setPreviewImg(null)} className="absolute top-3 right-3 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <label className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-2xl py-6 cursor-pointer transition-all ${uploadingImg ? 'border-white/10 opacity-50 pointer-events-none' : 'border-white/15 hover:border-emerald-500/50 hover:bg-emerald-500/5'}`}>
                {uploadingImg
                  ? <><Loader2 size={24} className="animate-spin text-emerald-400" /><span className="text-sm text-white/50">Mengupload foto...</span></>
                  : <><div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><ImagePlus size={22} className="text-emerald-400" /></div><p className="text-sm font-semibold text-white/70">Klik untuk upload foto</p><p className="text-xs text-white/30">JPG · PNG · WEBP — maks. 5MB</p></>
                }
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleGalleryUpload} disabled={uploadingImg} />
              </label>

              {galleryLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 size={28} className="animate-spin text-emerald-400" />
                  <p className="text-sm text-white/40">Memuat foto...</p>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Images size={28} className="text-white/20" /></div>
                  <p className="text-sm text-white/30">Belum ada foto di galeri</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all aspect-square cursor-pointer" onClick={() => setPreviewImg(img.url)}>
                      <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id) }} disabled={deletingImgId === img.id} className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50">
                          {deletingImgId === img.id ? <><Loader2 size={13} className="animate-spin" /> Menghapus...</> : <><Trash2 size={13} /> Hapus</>}
                        </button>
                      </div>
                      {img.order === 0 && <div className="absolute top-2 left-2"><span className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold"><Star size={10} fill="white" /> Utama</span></div>}
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center font-bold">{img.order + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-white/30">Klik foto untuk preview · Hover untuk hapus</p>
              <button onClick={() => { setGalleryTarget(null); setPreviewImg(null) }} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">Selesai</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}