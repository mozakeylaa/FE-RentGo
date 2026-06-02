import axiosInstance, { unwrap } from './axios'
import type {
  User,
  Vehicle,
  VehicleImage,
  Rental,
  Payment,
  PaymentInfo,
  Invoice,
  PaymentMethod,
  RentalStatus,
  VehicleType,
  Review,
  VehicleReviews,
  VehicleStatus,
  PaginationMeta,
} from '@/types'

// ============================================================
// TYPES
// ============================================================

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface VehicleParams {
  type?: VehicleType
  status?: VehicleStatus
  search?: string
  page?: number
  limit?: number
  location?: string
  category?: string
}

export interface VehicleListResponse {
  items: Vehicle[]
  meta: PaginationMeta
}

export interface CreateVehicleDto {
  name: string
  type: VehicleType
  category?: string
  brand: string
  model: string
  year: number
  plateNumber: string
  pricePerDay: number
  status?: VehicleStatus
  imageUrl?: string
  description?: string
  location?: string
}

export type UpdateVehicleDto = Partial<CreateVehicleDto>

export interface CreateRentalDto {
  vehicleId: string
  startDate: string
  endDate: string
  note?: string
}

export interface RentalParams {
  status?: RentalStatus
  page?: number
  limit?: number
}

export interface RentalListResponse {
  items: Rental[]
  meta: PaginationMeta
}

export interface PaymentParams {
  status?: string
  page?: number
  limit?: number
}

export interface PaymentListResponse {
  items: Payment[]
  meta: PaginationMeta
}

export interface DashboardStats {
  totalUsers: number
  totalVehicles: number
  availableVehicles: number
  totalRentals: number
  pendingRentals: number
  totalRevenue: number
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  register: (payload: RegisterPayload): Promise<User> =>
    axiosInstance.post('/auth/register', payload).then(unwrap<User>),

  login: (payload: LoginPayload): Promise<LoginResponse> =>
    axiosInstance.post('/auth/login', payload).then(unwrap<LoginResponse>),

  me: (): Promise<User> =>
    axiosInstance.get('/auth/me').then(unwrap<User>),

  updateProfile: (dto: { name?: string; phone?: string }): Promise<User> =>
    axiosInstance.patch('/auth/profile', dto).then(unwrap<User>),

  uploadAvatar: (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap<User>)
  },
}

// ============================================================
// VEHICLE API
// ============================================================

export const vehicleApi = {
  getAll: (params?: VehicleParams): Promise<VehicleListResponse> =>
    axiosInstance.get('/vehicles', { params }).then(unwrap<VehicleListResponse>),

  getOne: (id: string): Promise<Vehicle> =>
    axiosInstance.get(`/vehicles/${id}`).then(unwrap<Vehicle>),

  create: (dto: CreateVehicleDto): Promise<Vehicle> =>
    axiosInstance.post('/vehicles', dto).then(unwrap<Vehicle>),

  update: (id: string, dto: UpdateVehicleDto): Promise<Vehicle> =>
    axiosInstance.patch(`/vehicles/${id}`, dto).then(unwrap<Vehicle>),

  remove: (id: string): Promise<void> =>
    axiosInstance.delete(`/vehicles/${id}`).then(() => undefined),

  uploadImage: (vehicleId: string, file: File): Promise<Vehicle> => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/vehicles/${vehicleId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap<Vehicle>)
  },

  getImages: (vehicleId: string): Promise<VehicleImage[]> =>
    axiosInstance.get(`/vehicles/${vehicleId}/images`).then(unwrap<VehicleImage[]>),

  uploadGalleryImage: (vehicleId: string, file: File): Promise<VehicleImage> => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/vehicles/${vehicleId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap<VehicleImage>)
  },

  deleteImage: (vehicleId: string, imageId: string): Promise<void> =>
    axiosInstance.delete(`/vehicles/${vehicleId}/images/${imageId}`).then(() => undefined),
}

// ============================================================
// RENTAL API
// ============================================================

export const rentalApi = {
  create: (dto: CreateRentalDto): Promise<Rental> =>
    axiosInstance.post('/rentals', dto).then(unwrap<Rental>),

  getAll: (params?: RentalParams): Promise<Rental[]> =>
    axiosInstance.get('/rentals', { params }).then((res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : d?.items ?? []
    }),

  getAllPaginated: (params?: RentalParams): Promise<RentalListResponse> =>
    axiosInstance.get('/rentals', { params }).then((res) => {
      const d = res.data.data
      return Array.isArray(d)
        ? { items: d, meta: { page: 1, limit: 10, total: d.length, totalPages: 1 } }
        : d
    }),

  getOne: (id: string): Promise<Rental> =>
    axiosInstance.get(`/rentals/${id}`).then(unwrap<Rental>),

  updateStatus: (id: string, status: RentalStatus): Promise<Rental> =>
    axiosInstance.patch(`/rentals/${id}/status`, { status }).then(unwrap<Rental>),

  complete: (id: string): Promise<Rental> =>
    axiosInstance.patch(`/rentals/${id}/complete`).then(unwrap<Rental>),

  cancel: (id: string): Promise<Rental> =>
    axiosInstance.patch(`/rentals/${id}/cancel`).then(unwrap<Rental>),
}

// ============================================================
// PAYMENT API
// ============================================================

export interface CreatePaymentDto {
  rentalId: string
  method: PaymentMethod
}

export const paymentApi = {
  create: (dto: CreatePaymentDto): Promise<Payment> =>
    axiosInstance.post('/payments', dto).then(unwrap<Payment>),

  getAll: (): Promise<Payment[]> =>
    axiosInstance.get('/payments').then((res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : d?.items ?? []
    }),

  getAllPaginated: (params?: PaymentParams): Promise<PaymentListResponse> =>
    axiosInstance.get('/payments', { params }).then((res) => {
      const d = res.data.data
      return Array.isArray(d)
        ? { items: d, meta: { page: 1, limit: 10, total: d.length, totalPages: 1 } }
        : d
    }),

  getByRental: (rentalId: string): Promise<Payment> =>
    axiosInstance.get(`/payments/rental/${rentalId}`).then(unwrap<Payment>),

  confirm: (id: string): Promise<Payment> =>
    axiosInstance.post(`/payments/${id}/pay`).then(unwrap<Payment>),

  getPaymentInfo: (method: string): Promise<PaymentInfo> =>
    axiosInstance.get(`/payments/info/${method}`).then(unwrap<PaymentInfo>),

  uploadProof: (id: string, file: File): Promise<{ proofUrl: string; proofStatus: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/payments/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap<{ proofUrl: string; proofStatus: string }>)
  },

  confirmPayment: (id: string): Promise<Payment> =>
    axiosInstance.post(`/payments/${id}/confirm`).then(unwrap<Payment>),

  rejectPayment: (id: string): Promise<Payment> =>
    axiosInstance.post(`/payments/${id}/reject`).then(unwrap<Payment>),
}

// ============================================================
// INVOICE API
// ============================================================

export const invoiceApi = {
  getAll: (): Promise<Invoice[]> =>
    axiosInstance.get('/invoices').then(unwrap<Invoice[]>),

  getByRental: (rentalId: string): Promise<Invoice> =>
    axiosInstance.get(`/invoices/rental/${rentalId}`).then(unwrap<Invoice>),

  generate: (rentalId: string): Promise<Invoice> =>
    axiosInstance.post(`/invoices/rental/${rentalId}/generate`).then(unwrap<Invoice>),
}

// ============================================================
// REVIEW API
// ============================================================

export interface CreateReviewDto {
  rentalId: string
  rating: number
  comment: string
}

export const reviewApi = {
  create: (dto: CreateReviewDto): Promise<Review> =>
    axiosInstance.post('/reviews', dto).then(unwrap<Review>),

  getAll: (): Promise<Review[]> =>
    axiosInstance.get('/reviews').then(unwrap<Review[]>),

  getMy: (): Promise<Review[]> =>
    axiosInstance.get('/reviews/my').then(unwrap<Review[]>),

  getByVehicle: (vehicleId: string): Promise<VehicleReviews> =>
    axiosInstance.get(`/reviews/vehicle/${vehicleId}`).then(unwrap<VehicleReviews>),

  delete: (id: string): Promise<void> =>
    axiosInstance.delete(`/reviews/${id}`).then(() => undefined),
}

// ============================================================
// USER API (ADMIN)
// ============================================================

export const userApi = {
  getAll: (): Promise<User[]> =>
    axiosInstance.get('/users').then(unwrap<User[]>),

  getOne: (id: string): Promise<User> =>
    axiosInstance.get(`/users/${id}`).then(unwrap<User>),

  update: (id: string, dto: Partial<User>): Promise<User> =>
    axiosInstance.patch(`/users/${id}`, dto).then(unwrap<User>),

  remove: (id: string): Promise<void> =>
    axiosInstance.delete(`/users/${id}`).then(() => undefined),
}

// ============================================================
// DASHBOARD API (ADMIN)
// ============================================================

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    axiosInstance.get('/dashboard/stats').then((res) => {
      // Response shape: { data: { totals, vehicles, rentals, recentRentals } }
      const d = res.data?.data
      return {
        totalUsers:        d?.totals?.users        ?? 0,
        totalVehicles:     d?.totals?.vehicles      ?? 0,
        availableVehicles: d?.vehicles?.available   ?? 0,
        totalRentals:      d?.totals?.rentals        ?? 0,
        pendingRentals:    d?.rentals?.pending       ?? 0,
        totalRevenue:      d?.totals?.revenue        ?? 0,
      } as DashboardStats
    }),
}