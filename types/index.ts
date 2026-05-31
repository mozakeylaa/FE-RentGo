export type Role = "ADMIN" | "USER";
export type VehicleType = "CAR" | "MOTORCYCLE" | "BICYCLE" | "BUS";
export type VehicleStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";
export type RentalStatus = "PENDING" | "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "TRANSFER" | "CASH" | "QRIS";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  pricePerDay: number;
  status: VehicleStatus;
  imageUrl?: string;
  images?: VehicleImage[];
  description?: string;
  location?: string
}

export interface Rental {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: RentalStatus;
  vehicle?: Vehicle;
  user?: User;
  payment?: Payment | null;  // ← tambah ini
}

export interface PaymentAccount {
  bank?: string
  accountNumber?: string
  accountName?: string
  platform?: string
  number?: string
}

export interface PaymentInfo {
  method: string
  instructions: string
  accounts?: PaymentAccount[]
  qrisImageUrl?: string
  qrisName?: string
  qrisNmid?: string
  note?: string
}

export interface Payment {
  id: string;
  rentalId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  reference?: string;
  proofUrl?: string;
  proofStatus?: 'PENDING_REVIEW' | 'REJECTED' | null;
  paymentInfo?: PaymentInfo;
  createdAt: string;
  updatedAt: string;
  rental?: Rental;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Invoice {
  id: string
  rentalId: string
  invoiceNumber: string
  amount: number
  issuedAt: string
  rental?: Rental
}

export interface Review {
  id: string
  rentalId: string
  rating: number
  comment: string
  user?: { name: string }
  createdAt: string
}

export interface VehicleReviews {
  vehicleId: string
  avgRating: number
  totalReviews: number
  reviews: Review[]
}

export interface VehicleImage {
  id: string
  url: string
  publicId: string
  order: number
}