export interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isVerified: boolean;
  profileImageUrl?: string;
}

export interface Address {
  id: number;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface Shop {
  id: number;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  status: string;
  ratingAvg: number;
  totalReviews: number;
  isAcceptingOrders: boolean;
  distanceKm?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  shopId: number;
  shopName: string;
  status: OrderStatus;
  deliveryType: 'PICKUP' | 'DELIVERY';
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PRINTING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  fileName?: string;
  pageCount: number;
  copies: number;
  colorMode: string;
  sides: string;
  paperSize?: string;
  binding?: string;
  lamination: boolean;
  lineTotal: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
