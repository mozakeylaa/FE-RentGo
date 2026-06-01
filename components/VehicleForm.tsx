'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Upload, ImageIcon } from 'lucide-react'
import FormInput from '@/components/FormInput'
import type { Vehicle } from '@/types'

const vehicleSchema = z.object({
  name:        z.string().min(1, 'Nama wajib diisi'),
  brand:       z.string().min(1, 'Merek wajib diisi'),
  model:       z.string().min(1, 'Model wajib diisi'),
  type:        z.enum(['CAR', 'MOTORCYCLE', 'BICYCLE', 'BUS']),
  category:    z.string().optional(),
  status:      z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']),
  year:        z.coerce.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear() + 1, 'Tahun tidak valid'),
  plateNumber: z.string().min(1, 'Plat nomor wajib diisi'),
  pricePerDay: z.coerce.number().min(1, 'Harga harus lebih dari 0'),
  description: z.string().optional(),
  location:    z.string().optional(),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleFormProps {
  initial?:   Vehicle
  onSubmit:   (data: VehicleFormData, imageFile?: File) => Promise<void>
  onClose:    () => void
  submitting: boolean
}

// Opsi kategori berdasarkan tipe
const CATEGORY_OPTIONS: Record<string, string[]> = {
  CAR:        ['MPV', 'SUV', 'Sedan', 'Hatchback', 'Pickup', 'Van'],
  MOTORCYCLE: ['Matic', 'Manual', 'Sport', 'Bebek'],
  BICYCLE:    ['MTB', 'Road Bike', 'City Bike'],
  BUS:        ['Mini Bus', 'Bus Besar'],
}

export default function VehicleForm({ initial, onSubmit, onClose, submitting }: VehicleFormProps) {
  const {
    register, handleSubmit, reset, watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      type:     'CAR',
      status:   'AVAILABLE',
      year:     new Date().getFullYear(),
      category: '',
    },
  })

  const fileInputRef              = useRef<HTMLInputElement>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const selectedType = watch('type')

  // Reset category saat type berubah
  useEffect(() => {
    setValue('category', '')
  }, [selectedType, setValue])

  useEffect(() => {
    if (initial) {
      reset({
        name:        initial.name,
        brand:       initial.brand,
        model:       initial.model,
        type:        initial.type,
        category:    (initial as any).category ?? '',
        status:      initial.status,
        year:        initial.year,
        plateNumber: initial.plateNumber,
        pricePerDay: initial.pricePerDay,
        description: initial.description ?? '',
        location:    initial.location    ?? '',
      })
      if (initial.imageUrl) setPreview(initial.imageUrl)
    }
  }, [initial, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (jpg, png, dll)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setPreview(initial?.imageUrl ?? null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFormSubmit = (data: VehicleFormData) => {
    onSubmit(data, imageFile ?? undefined)
  }

  const categoryOptions = CATEGORY_OPTIONS[selectedType] ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-lg">
            {initial ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-4">

          {/* Upload Gambar */}
          <div>
            <label className="label">Foto Kendaraan (opsional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50"
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <Upload size={16} /> Ganti Foto
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon size={32} />
                  <p className="text-sm font-medium">Klik untuk upload foto</p>
                  <p className="text-xs">JPG, PNG, WEBP — maks. 5MB</p>
                </div>
              )}
            </div>
            {preview && imageFile && (
              <button type="button" onClick={removeImage} className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1">
                <X size={12} /> Hapus foto
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Field utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Nama Kendaraan"     required error={errors.name?.message}        {...register('name')}        placeholder="Toyota Avanza" />
            <FormInput label="Merek"              required error={errors.brand?.message}       {...register('brand')}       placeholder="Toyota" />
            <FormInput label="Model"              required error={errors.model?.message}       {...register('model')}       placeholder="Avanza 1.3 G" />
            <FormInput label="Tahun"              required type="number" error={errors.year?.message} {...register('year')} placeholder="2022" />
            <FormInput label="Plat Nomor"         required error={errors.plateNumber?.message} {...register('plateNumber')} placeholder="B 1234 XYZ" />
            <FormInput label="Harga / Hari (Rp)"  required type="number" error={errors.pricePerDay?.message} {...register('pricePerDay')} placeholder="250000" />
          </div>

          {/* Tipe + Kategori */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipe <span className="text-red-500">*</span></label>
              <select className="input-field" {...register('type')}>
                <option value="CAR">Mobil</option>
                <option value="MOTORCYCLE">Motor</option>
                <option value="BICYCLE">Sepeda</option>
                <option value="BUS">Bus</option>
              </select>
              {errors.type && <p className="error-msg">{errors.type.message}</p>}
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input-field" {...register('category')}>
                <option value="">-- Pilih Kategori --</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="error-msg">{errors.category.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="label">Status <span className="text-red-500">*</span></label>
            <select className="input-field" {...register('status')}>
              <option value="AVAILABLE">Tersedia</option>
              <option value="RENTED">Disewa</option>
              <option value="MAINTENANCE">Perawatan</option>
            </select>
            {errors.status && <p className="error-msg">{errors.status.message}</p>}
          </div>

          {/* Lokasi */}
          <FormInput
            label="Lokasi"
            error={errors.location?.message}
            {...register('location')}
            placeholder="Contoh: Surabaya, Jakarta..."
          />

          {/* Deskripsi */}
          <div>
            <label className="label">Deskripsi (opsional)</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Deskripsi singkat kendaraan..."
              {...register('description')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
                : initial ? 'Simpan Perubahan' : 'Tambah Kendaraan'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}