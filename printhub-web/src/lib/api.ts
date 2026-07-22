/** PrintHub API Client */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xershop-production.up.railway.app/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const authData = localStorage.getItem('printhub-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken || null;
      }
    } catch (e) {
      console.error(e);
    }
    return localStorage.getItem('accessToken');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('printhub-auth');
    document.cookie = 'printhub-auth-token=; path=/; max-age=0; SameSite=Lax';
  }

  setToken(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    try {
      const authData = localStorage.getItem('printhub-auth');
      const parsed = authData ? JSON.parse(authData) : { state: {} };
      parsed.state.accessToken = accessToken;
      if (refreshToken) {
        parsed.state.refreshToken = refreshToken;
      }
      parsed.state.isAuthenticated = true;
      localStorage.setItem('printhub-auth', JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiClient();

// Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Auth API
export const authApi = {
  register: (data: { name: string; email?: string; phone: string; password: string; referralCode?: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/register', data),

  login: (data: { identifier: string; password: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/login', data),

  refreshToken: (data: { refreshToken: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', data),

  logout: () =>
    api.post<ApiResponse<void>>('/auth/logout'),

  forgotPassword: (identifier: string) =>
    api.post<ApiResponse<void>>('/auth/forgot-password', { identifier }),

  resetPassword: (identifier: string, otp: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/reset-password', { identifier, otp, newPassword }),

  sendOtp: (identifier: string, purpose: string) =>
    api.post<ApiResponse<{ message: string; otp: string }>>('/auth/otp/send', { identifier, purpose }),

  verifyOtp: (identifier: string, otp: string, purpose: string) =>
    api.post<ApiResponse<void>>('/auth/otp/verify', { identifier, otp, purpose }),
};

// User API
export const userApi = {
  getMe: () =>
    api.get<ApiResponse<User>>('/users/me'),

  updateProfile: (data: { name?: string; email?: string }) =>
    api.put<ApiResponse<User>>('/users/me', data),

  getAddresses: () =>
    api.get<ApiResponse<Address[]>>('/users/me/addresses'),

  addAddress: (data: Omit<Address, 'id' | 'createdAt'>) =>
    api.post<ApiResponse<Address>>('/users/me/addresses', data),

  updateAddress: (id: string, data: Partial<Address>) =>
    api.put<ApiResponse<Address>>(`/users/me/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete<ApiResponse<void>>(`/users/me/addresses/${id}`),
};

// Shop API
export const shopApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<PagedResponse<Shop>>>(`/shops?page=${page}&size=${size}`),

  getNearby: (lat: number, lng: number, radius = 10, limit = 20) =>
    api.get<ApiResponse<Shop[]>>(`/shops/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`),

  getById: (id: string) =>
    api.get<ApiResponse<Shop>>(`/shops/${id}`),

  getDetails: (id: string) =>
    api.get<ApiResponse<ShopDetails>>(`/shops/${id}/details`),
};

// Order API
export const orderApi = {
  getPriceEstimate: (data: PriceEstimateRequest) =>
    api.post<ApiResponse<PriceEstimateResponse>>('/orders/price-estimate', data),

  create: (data: CreateOrderRequest) =>
    api.post<ApiResponse<Order>>('/orders', data),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),

  getByNumber: (orderNumber: string) =>
    api.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`),

  getMyOrders: (page = 0, size = 10) =>
    api.get<ApiResponse<PagedResponse<Order>>>(`/orders?page=${page}&size=${size}`),

  updateStatus: (id: string, data: { status: string; notes?: string; rejectionReason?: string }) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/status`, data),

  reorder: (id: string) =>
    api.post<ApiResponse<Order>>(`/orders/${id}/reorder`),

  deleteOrder: (id: number) =>
    api.delete<ApiResponse<void>>(`/orders/${id}`),
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const authData = localStorage.getItem('printhub-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.accessToken || null;
    }
  } catch { /* ignore */ }
  return localStorage.getItem('accessToken');
}

// File API
export const fileApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Upload failed (${response.status})`);
    }
    return json as ApiResponse<{ fileName: string; originalName: string }>;
  },

  getDownloadUrl: (fileName: string) => `${API_BASE_URL}/files/${fileName}`,
};

// Payment API
export const paymentApi = {
  submit: (data: { orderId: number; utr: string; screenshotPath?: string }) =>
    api.post<ApiResponse<Payment>>('/payments/submit', data),
  getUpiPay: (orderId: number) =>
    api.get<ApiResponse<UpiPayResponse>>('/payments/upi-pay/' + orderId),
};

export interface UpiPayResponse {
  orderId: number;
  orderNumber: string;
  amount: number;
  upiId: string;
  upiDeepLink: string;
  merchantName: string;
}

// Admin API
export const adminApi = {
  getOrders: (page = 0, size = 20) =>
    api.get<ApiResponse<PagedResponse<Order>>>(`/admin/orders?page=${page}&size=${size}`),

  updateOrderStatus: (id: number, data: { status: string; notes?: string }) =>
    api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, data),

  getPendingPayments: () =>
    api.get<ApiResponse<Payment[]>>('/admin/payments/pending'),

  approvePayment: (id: number) =>
    api.post<ApiResponse<Payment>>(`/admin/payments/${id}/approve`, {}),

  rejectPayment: (id: number, reason?: string) =>
    api.post<ApiResponse<Payment>>(`/admin/payments/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, {}),

  ping: () =>
    api.get<ApiResponse<string>>('/admin/ping'),

  deleteOrder: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/orders/${id}`),
};

// Types
export interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
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
  createdAt?: string;
}

export interface Shop {
  id: number;
  ownerId: number;
  ownerName: string;
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

export interface ShopDetails extends Shop {
  printers: Printer[];
  pricingRules: PricingRule[];
  recentReviews: Review[];
}

export interface Printer {
  id: number;
  name: string;
  model?: string;
  type: string;
  status: string;
  maxPaperSize?: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
}

export interface PricingRule {
  id: number;
  paperSize?: string;
  gsm?: number;
  colorMode?: string;
  sides?: string;
  binding?: string;
  basePrice: number;
  pricePerPage?: number;
  pricePerCopy?: number;
  laminationPrice?: number;
  bindingPrice?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  shopId: number;
  shopName: string;
  status: string;
  deliveryType: string;
  deliveryAddress?: Address;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  totalAmount: number;
  couponCode?: string;
  walletAmountUsed?: number;
  notes?: string;
  rejectionReason?: string;
  estimatedCompletionAt?: string;
  completedAt?: string;
  createdAt: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
  userName?: string;
  userPhone?: string;
  screenshotPath?: string;
  paymentStatus?: string;
}

export interface OrderItem {
  id: number;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  pageCount: number;
  copies: number;
  colorMode: string;
  sides: string;
  paperSize?: string;
  gsm?: number;
  binding?: string;
  lamination: boolean;
  pageRange?: string;
  lineTotal: number;
}

export interface OrderTimeline {
  id: number;
  status: string;
  notes?: string;
  changedByName?: string;
  createdAt: string;
}

export interface PriceEstimateRequest {
  shopId: number;
  items: {
    pageCount: number;
    copies: number;
    colorMode: string;
    sides: string;
    paperSize?: string;
    gsm?: number;
    binding?: string;
    lamination?: boolean;
  }[];
  couponCode?: string;
  walletAmountUsed?: number;
  envelopePackaging?: boolean;
}

export interface PriceEstimateResponse {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  walletDiscount: number;
  totalAmount: number;
  couponApplied?: string;
  couponDiscount?: number;
  itemBreakdowns: {
    pageCount: number;
    copies: number;
    colorMode: string;
    paperSize?: string;
    basePrice: number;
    printingCost: number;
    bindingCost: number;
    laminationCost: number;
    lineTotal: number;
  }[];
}

export interface CreateOrderRequest {
  shopId: number;
  deliveryType: string;
  addressId?: number;
  items: {
    fileUrl?: string;
    fileName: string;
    fileType?: string;
    pageCount: number;
    copies: number;
    colorMode: string;
    sides: string;
    paperSize?: string;
    gsm?: number;
    binding?: string;
    lamination?: boolean;
    pageRange?: string;
  }[];
  couponCode?: string;
  walletAmountUsed?: number;
  notes?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
  amount: number;
  currency: string;
  method?: string;
  createdAt: string;
  utr?: string;
  screenshotPath?: string;
  userName?: string;
  userPhone?: string;
  contactPhone?: string;
}

export interface PaymentOrderResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface Review {
  id: number;
  orderId: number;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  images?: string[];
  shopResponse?: string;
  createdAt: string;
}
